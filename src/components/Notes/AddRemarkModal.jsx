import React, { useEffect } from "react";
import {
    Modal,
    Box,
    Tabs,
    Tab,
    TextField,
    Button,
    Typography,
    IconButton
} from "@mui/material";
import "./AddRemarkModal.scss";
import { CircleX } from "lucide-react";

const tabLabels = ["Personal", "Special", "Family"];

const AddRemarkModal = ({
    open,
    onClose,
    tabIndex,
    setTabIndex,
    text,
    setText,
    onSave,
    editMode = false,
    initialData = null
}) => {
    useEffect(() => {
        if (editMode && initialData) {
            const index = {
                "Person Remark": 0,
                "Special Remark": 1,
                "Family Remark": 2,
            }[initialData.group] || 0;

            setTabIndex(index);
            setText(initialData.title || "");
        }
    }, [editMode, initialData, setTabIndex, setText]);

    return (
        <Modal open={open} onClose={onClose}>
            <Box className="mui-modal-box">
                <Typography variant="h6" gutterBottom>
                    {editMode ? "Edit Remark" : "Add New Remark"}
                </Typography>

                <Tabs
                    TabIndicatorProps={{ style: { backgroundColor: '#b8860b' } }}
                    sx={{
                        "& .MuiTab-root": {
                            color: "#666",
                            fontFamily: "'Poppins', sans-serif"
                        },
                        "& .Mui-selected": {
                            color: "#b8860b",
                        },
                    }} value={tabIndex} onChange={(e, val) => setTabIndex(val)} centered>
                    {tabLabels.map((label) => (
                        <Tab key={label} label={label} />
                    ))}
                </Tabs>

                <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder={`Enter ${tabLabels[tabIndex]} Remark`}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    sx={{ mt: 2 }}
                    className="remark-text-field"
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button className="btnCancel" onClick={onClose} sx={{ mr: 1 }}>
                        Cancel
                    </Button>
                    <Button variant="contained" className="buttonSave" onClick={onSave}>
                        {editMode ? "Update" : "Save"}
                    </Button>
                </Box>

                <IconButton onClick={onClose} className="close-icon">
                    <CircleX />
                </IconButton>
            </Box>
        </Modal>
    );
};

export default AddRemarkModal;