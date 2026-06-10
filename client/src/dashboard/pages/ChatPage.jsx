import ChatPanel from "../../components/ChatPanel";
import { useApp } from "../useApp";

export default function ChatPage() {
  const { token, rawUser, myTeachers } = useApp();
  return (
    <div style={{ margin: "-24px", height: "calc(100vh - 60px)" }}>
      <ChatPanel
        token={token}
        user={rawUser}
        assignments={rawUser?.programAssignments || []}
        teachers={myTeachers}
      />
    </div>
  );
}
