import ChatPanel from "../../components/ChatPanel";
import { useApp } from "../useApp";

export default function ChatPage({ tab, onTabChange }) {
  const { token, rawUser, myTeachers } = useApp();
  return (
    <ChatPanel
      token={token}
      user={rawUser}
      assignments={rawUser?.programAssignments || []}
      teachers={myTeachers}
      tab={tab}
      onTabChange={onTabChange}
    />
  );
}