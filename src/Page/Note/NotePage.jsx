import NotesCard from "../../components/Notes/NoteCard";
import AddRemarkModal from "../../components/Notes/AddRemarkModal";
import "./NotePage.scss";
import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { CallApi } from "../../API/CallApi/CallApi";
import LoadingBackdrop from "../../Utils/LoadingBackdrop";

const parseDotNetDate = (dotNetDate) => {
  const timestamp = Number(dotNetDate.match(/\d+/)[0]);
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const GROUP_CONFIG = {
  "Personal Remark": {
    color: "#ff9800",
    cardColor: "#fff8f0",
    pill: "pill-personal",
    dot: "dot-personal",
  },
  "Special Remark": {
    color: "#e91e63",
    cardColor: "#fff0f5",
    pill: "pill-special",
    dot: "dot-special",
  },
  "Family Remark": {
    color: "#7c4dff",
    cardColor: "#f5f0ff",
    pill: "pill-family",
    dot: "dot-family",
  },
};

const NotePage = () => {
  const [remarkData, setRemarkData] = useState({
    "Personal Remark": [],
    "Special Remark": [],
    "Family Remark": [],
  });

  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [text, setText] = useState("");
  const activeCust = JSON?.parse(sessionStorage.getItem("curruntActiveCustomer"));
  const [originalText, setOriginalText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getGroupByRemarkType = (typeId) => {
    switch (typeId) {
      case 1: return "Personal Remark";
      case 2: return "Special Remark";
      case 3: return "Family Remark";
      default: return "Personal Remark";
    }
  };

  useEffect(() => {
    if (editMode && editData) {
      const index = {
        "Personal Remark": 0,
        "Special Remark": 1,
        "Family Remark": 2,
      }[editData.group] || 0;
      setTabIndex(index);
      setText(editData.title || "");
      setOriginalText(editData.title || "");
    }
  }, [editMode, editData]);

  const getRemarkTypeIdByTab = (tabIndex) => tabIndex + 1;

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setText("");
    setTabIndex(0);
    setEditMode(false);
  };

  const GetNotesData = async () => {
    setIsLoading(true);
    const Device_Token = sessionStorage.getItem("device_token");
    const body = {
      Mode: "GetNotes",
      Token: `"${Device_Token}"`,
      ReqData: JSON.stringify([
        {
          ForEvt: "GetNotes",
          DeviceToken: Device_Token,
          AppId: 3,
          CustomerId: activeCust?.CustomerId,
        },
      ]),
    };

    const response = await CallApi(body);

    if (response?.DT?.length) {
      const groupedData = {
        "Personal Remark": [],
        "Special Remark": [],
        "Family Remark": [],
      };

      response.DT.forEach((item) => {
        const group = getGroupByRemarkType(item.RemarkTypeId);
        groupedData[group]?.push({
          NotesId: item.NotesId,
          title: item.Remark,
          date: parseDotNetDate(item.EntryDate),
          RemarkTypeId: item.RemarkTypeId,
        });
      });

      setRemarkData(groupedData);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    GetNotesData();
  }, []);

  const handleSave = async () => {
    if (!text.trim() && !editMode) { handleClose(); return; }
    if (editMode && text === originalText) { handleClose(); return; }

    setIsLoading(true);
    const Device_Token = sessionStorage.getItem("device_token");
    const remarkTypeId = getRemarkTypeIdByTab(tabIndex);
    const notesId = editMode ? editData?.NotesId : 0;

    const payload = {
      Mode: "SaveNotes",
      Token: `"${Device_Token}"`,
      ReqData: JSON.stringify([
        {
          ForEvt: "SaveNotes",
          DeviceToken: Device_Token,
          AppId: 3,
          NotesId: notesId,
          CustomerId: activeCust?.CustomerId,
          RemarkTypeId: remarkTypeId,
          Remark: text,
        },
      ]),
    };

    await CallApi(payload);
    handleClose();
    GetNotesData();
  };

  const handleEdit = (group, card) => {
    setEditData({
      NotesId: card.NotesId,
      group,
      title: card.title,
      RemarkTypeId: card.RemarkTypeId,
    });
    setText(card.title);
    setTabIndex(card.RemarkTypeId - 1);
    setEditMode(true);
    setOpen(true);
  };

  const filteredRemarks = Object.entries(remarkData).filter(
    ([_, cards]) => Array.isArray(cards) && cards.length > 0
  );

  return (
    <div className="remark-page">
      <LoadingBackdrop isLoading={isLoading} />

      {!isLoading && (
        <>
          {filteredRemarks.length > 0 ? (
            <div className="remark-scroll">
              {/* Category pills */}
              <div className="category-pills">
                {Object.keys(GROUP_CONFIG).map((group) => (
                  <span key={group} className={`pill ${GROUP_CONFIG[group].pill}`}>
                    {group.replace(" Remark", "")}
                  </span>
                ))}
              </div>

              {/* Remark groups */}
              {filteredRemarks.map(([group, cards]) => (
                <div key={group} className="remark-group">
                  <div className="group-header">
                    <span
                      className="group-dot"
                      style={{ background: GROUP_CONFIG[group]?.color }}
                    />
                    <span className="group-label">{group}</span>
                    <span className="group-count">{cards.length}</span>
                  </div>

                  <div className="remark-list">
                    {[...cards].reverse().map((card, index) => (
                      <NotesCard
                        key={index}
                        card={card}
                        group={group}
                        dotColor={GROUP_CONFIG[group]?.color}
                        cardColor={GROUP_CONFIG[group]?.cardColor}
                        handleEdit={handleEdit}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <FaPlus size={22} color="#bbb" />
              </div>
              <p className="empty-title">No Remarks Yet</p>
              <p className="empty-sub">Tap + to add your first remark</p>
            </div>
          )}

          <button className="fab-button" onClick={handleOpen}>
            <FaPlus />
          </button>
        </>
      )}

      <AddRemarkModal
        open={open}
        onClose={handleClose}
        tabIndex={tabIndex}
        setTabIndex={setTabIndex}
        text={text}
        setText={setText}
        initialData={editData}
        editMode={editMode}
        onSave={handleSave}
      />
    </div>
  );
};

export default NotePage;