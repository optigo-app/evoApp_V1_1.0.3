import React, { useEffect, useState } from "react";
import "./FeedBack.scss";
import {
  Box,
  Button,
  Typography,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { House, MessageSquarePlus, ChevronLeft } from "lucide-react";
import { CallApi } from "../../API/CallApi/CallApi";
import LoadingBackdrop from "../../Utils/LoadingBackdrop";
import { showToast } from "../../Utils/Tostify/ToastManager";

const FeedBack = () => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [allFeedBackData, setAllFeedBackData] = useState();
  const [loading, setLoading] = useState(false);
  const [remarkModal, setRemarkModal] = useState(false);
  const [currentQId, setCurrentQId] = useState(null);
  const [remarkText, setRemarkText] = useState("");
  const activeCust = JSON?.parse(sessionStorage.getItem("curruntActiveCustomer"));
  const [confirmModal, setConfirmModal] = useState(false);

  const GetFeedBackData = async () => {
    setLoading(true);
    const Device_Token = sessionStorage.getItem("device_token");
    const body = {
      Mode: "GetFeedbackList",
      Token: `"${Device_Token}"`,
      ReqData: JSON.stringify([
        {
          ForEvt: "GetFeedbackList",
          DeviceToken: Device_Token,
          AppId: 3,
        },
      ]),
    };
    const response = await CallApi(body);
    if (response?.DT) {
      setAllFeedBackData(response?.DT);
    }
    setLoading(false);
  };

  const emojiOptions = [
    { id: "1", label: "Good", emoji: "🙂" },
    { id: "2", label: "Very Good", emoji: "😊" },
    { id: "3", label: "Excellent", emoji: "😍" },
    { id: "4", label: "Average", emoji: "😐" },
  ];

  const starOptions = ["1", "2", "3", "4", "5"];

  useEffect(() => {
    GetFeedBackData();
  }, []);

  const handleOptionChange = (question, optionId) => {
    setAnswers((prev) => ({
      ...prev,
      [question.QuestionId]: {
        ...(prev[question.QuestionId] || {}),
        OptionId: optionId.toString(),
        IsRemark: question.IsRemark,
      },
    }));
  };

  const openRemarkModal = (questionId) => {
    setCurrentQId(questionId);
    setRemarkText(answers?.[questionId]?.Remark || "");
    setRemarkModal(true);
  };

  const saveRemark = () => {
    setAnswers((prev) => ({
      ...prev,
      [currentQId]: {
        ...prev[currentQId],
        IsRemark: 1,
        Remark: remarkText,
      },
    }));
    setRemarkModal(false);
  };

  const handleSubmitClick = () => {
    if (Object.keys(answers).length === 0) {
      setConfirmModal(true);
      return;
    }

    handleSave();
  };

  const handleSave = async () => {
    const Device_Token = sessionStorage.getItem("device_token");
    const feedbackArray = Object.keys(answers).map((qid) => ({
      QuestionId: qid,
      OptionId: answers[qid].OptionId || "",
      IsRemark: answers[qid].IsRemark.toString(),
      Remark: answers[qid].Remark || "",
    }));
    const body = {
      Mode: "SaveFeedback",
      Token: `"${Device_Token}"`,
      ReqData: JSON.stringify([
        {
          ForEvt: "SaveFeedback",
          DeviceToken: Device_Token,
          AppId: 3,
          CustomerId: activeCust?.CustomerId,
          FeedbackData: feedbackArray,
        },
      ]),
    };
    await CallApi(body);
    showToast({
      message: "Feedback saved successfully!",
      bgColor: "linear-gradient(to right, #b2069b, #3909c2)",
            fontColor: "white",
      duration: 3000,
    });
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  return (
    <div className="fb-root">
      <Dialog
        open={confirmModal}
        onClose={() => setConfirmModal(false)}
        fullWidth
        PaperProps={{ className: "fb-dialog" }}
      >
        <DialogTitle>Confirm Submission</DialogTitle>

        <DialogContent>
          <Typography>
            Please complete the form before submitting.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ padding: "12px 20px 20px" }}>
          <Button
            onClick={() => {
              setConfirmModal(false);
              navigate("/");
            }}
            sx={{ color: "#6b7280", fontWeight: 600 }}
          >
            Exit
          </Button>

          <Button
            variant="contained"
            onClick={() => setConfirmModal(false)}
            sx={{
              background: "linear-gradient(135deg,#7c3aed,#a855f7)",
              borderRadius: "10px",
              fontWeight: 700,
            }}
          >
            Fill Now
          </Button>
        </DialogActions>
      </Dialog>
      <LoadingBackdrop isLoading={loading} />
      
      <header className="fb-appbar">
        <button className="fb-appbar__back" onClick={() => navigate("/")}>
          <ChevronLeft size={22} />
        </button>
        <span className="fb-appbar__title">Feedback Form</span>
        <button className="fb-appbar__home" onClick={() => navigate("/")}>
          <House size={18} />
        </button>
      </header>

      {/* ── Hero Banner ── */}
      <div className="fb-hero">
        <div className="fb-hero__icon">💬</div>
        <p className="fb-hero__sub">Your feedback helps us improve</p>
      </div>

      {/* ── Questions ── */}
      <div className="fb-scroll">
        {allFeedBackData?.map((q, idx) => {
          const options = [q.option1, q.option2, q.option3, q.option4].filter(Boolean);
          const hasAnswer = !!answers?.[q.QuestionId]?.OptionId;

          return (
            <div key={q.QuestionId} className={`fb-card ${hasAnswer ? "fb-card--answered" : ""}`}>
              <div className="fb-card__num">{String(idx + 1).padStart(2, "0")}</div>
              <p className="fb-card__question">{q.Question}</p>

              {/* ⭐ Stars */}
              {q.IsStar === 1 ? (
                <div className="fb-stars">
                  {starOptions.map((star) => {
                    const filled = Number(answers?.[q.QuestionId]?.OptionId) >= Number(star);
                    return (
                      <button
                        key={star}
                        className={`fb-stars__star ${filled ? "fb-stars__star--on" : ""}`}
                        onClick={() => handleOptionChange(q, star)}
                        aria-label={`Rate ${star} star`}
                      >
                        ★
                      </button>
                    );
                  })}
                </div>

              ) : q.IsEmoji === 1 ? (
                /* 😊 Emoji */
                <div className="fb-emoji">
                  {emojiOptions.map((item) => {
                    const active = answers?.[q.QuestionId]?.OptionId === item.id;
                    return (
                      <button
                        key={item.id}
                        className={`fb-emoji__btn ${active ? "fb-emoji__btn--active" : ""}`}
                        onClick={() => handleOptionChange(q, item.id)}
                      >
                        <span className="fb-emoji__icon">{item.emoji}</span>
                        <span className="fb-emoji__label">{item.label}</span>
                      </button>
                    );
                  })}
                </div>

              ) : (
                /* Radio */
                options.length > 0 && (
                  <RadioGroup
                    className="fb-radio"
                    value={answers?.[q.QuestionId]?.OptionId || ""}
                    onChange={(e) => handleOptionChange(q, e.target.value)}
                  >
                    {options.map((opt, index) => (
                      <FormControlLabel
                        key={index}
                        value={(index + 1).toString()}
                        control={<Radio size="small" sx={{ color: "#a78bfa", "&.Mui-checked": { color: "#7c3aed" } }} />}
                        label={opt}
                        className="fb-radio__item"
                      />
                    ))}
                  </RadioGroup>
                )
              )}

              {/* Remark button */}
              {q.IsRemark === 1 && (
                <button
                  className={`fb-remark-btn ${answers?.[q.QuestionId]?.Remark ? "fb-remark-btn--filled" : ""}`}
                  onClick={() => openRemarkModal(q.QuestionId)}
                >
                  <MessageSquarePlus size={14} />
                  {answers?.[q.QuestionId]?.Remark ? "Edit Remark" : "Add Remark"}
                </button>
              )}
            </div>
          );
        })}

        {/* bottom padding for sticky bar */}
        <div style={{ height: 100 }} />
      </div>

      {/* ── Sticky Footer Buttons ── */}
      <div className="fb-footer">
        <button className="fb-footer__cancel" onClick={() => navigate("/")}>
          Cancel
        </button>
        <button className="fb-footer__save" onClick={handleSubmitClick}>
          Submit Feedback
        </button>
      </div>

      {/* ── Remark Dialog ── */}
      <Dialog
        open={remarkModal}
        onClose={() => setRemarkModal(false)}
        fullWidth
        PaperProps={{ className: "fb-dialog" }}
      >
        <DialogTitle className="fb-dialog__title">Add Remark</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={remarkText}
            onChange={(e) => setRemarkText(e.target.value)}
            placeholder="Share your thoughts…"
            variant="outlined"
            sx={{
              mt: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                fontSize: "14px",
                "&.Mui-focused fieldset": { borderColor: "#7c3aed" },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ padding: "12px 20px 20px" }}>
          <Button onClick={() => setRemarkModal(false)} sx={{ color: "#6b7280", fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={saveRemark}
            sx={{
              background: "linear-gradient(135deg,#7c3aed,#a855f7)",
              borderRadius: "10px",
              fontWeight: 700,
              boxShadow: "0 4px 12px rgba(124,58,237,0.35)",
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FeedBack;