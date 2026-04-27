import { Pencil } from "lucide-react";
import "./NoteCard.scss";

const NotesCard = ({ card, group, handleEdit }) => {
  return (
    <div className="remark-card" style={{ background: card?.color }}>
      <div className="remark-title">{card?.title}</div>
      <div className="remark-footer">
        <span>{card?.date}</span>
        <div className="remark-icons">
          <Pencil  className="edit-icon" onClick={() => handleEdit(group, card)}/>
        </div>
      </div>
    </div>
  );
};

export default NotesCard;
