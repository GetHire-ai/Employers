import React, { useEffect, useState, useRef, useMemo } from "react";
import { format } from "date-fns";
import { Hourglass } from "react-loader-spinner";
import useSocket from "./useSocket";

const Chat = () => {
  const companyId = localStorage.getItem("companyid");
  const messagesEndRef = useRef(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showOldMessages, setShowOldMessages] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socket = useSocket(companyId);

  useEffect(() => {
    socket.on("userStatus", (onlineUsers) => {
      setOnlineUsers(onlineUsers);
    });

    socket.emit("getConversations", companyId);

    socket.on("conversationsList", (conversations) => {
      setConversations(conversations);
    });

    return () => {
      socket.off("userStatus");
      socket.off("conversationsList");
    };
  }, [socket, companyId]);

  useEffect(() => {
    if (currentConversationId) {
      socket.emit("joinConversation", currentConversationId);
      const handleNewMessage = (newMessage) => {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        scrollToBottom(); // Scroll to the bottom when a new message is received
      };

      socket.on("receiveMessage", handleNewMessage);

      return () => {
        socket.off("receiveMessage", handleNewMessage);
      };
    }
  }, [currentConversationId, socket]);

  const sendMessage = () => {
    if (message.trim() && currentConversationId) {
      const data = {
        conversationId: currentConversationId,
        senderId: companyId,
        senderType: "Company",
        message,
      };
      socket.emit("sendMessage", data);
      setTimeout(() => {
        socket.emit("getConversationMessages", currentConversationId);
        socket.emit("getConversations", companyId);
        socket.on("receiveMessage", (chatMessages, conversation) => {
          setConversations((prev) =>
            prev.map((oldConversation) =>
              oldConversation._id === conversation._id
                ? { ...oldConversation, ...conversation }
                : oldConversation
            )
          );
        });
      }, 500);
      setMessage("");
      scrollToBottom();
    }
  };

  const handleStudentClick = async (studentId, student, conversation) => {
    if (studentId !== currentStudent?._id) {
      setSearchQuery("");
      scrollToBottom();
      setCurrentConversationId(conversation?._id);
      setCurrentStudent(student);
      setMessages([]);
      setShowOldMessages(false);
    }
    try {
      setLoadingMessages(true);
      socket.emit("getConversationMessages", conversation._id);

      socket.on("conversationMessages", (response) => {
        if (response) {
          setMessages(response);
          scrollToBottom();
        }
      });
    } catch (error) {
      console.error("Error fetching messages via socket:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const groupedMessages = useMemo(() => {
    return messages?.reduce((acc, msg) => {
      const date = format(new Date(msg.timestamp), "yyyy-MM-dd");
      if (!acc[date]) acc[date] = [];
      acc[date].push(msg);
      return acc;
    }, {});
  }, [messages]);

  const isUserOnline = (studentId) => {
    return onlineUsers?.some((user) => user?.userId === studentId);
  };

  return (
    <div className="flex">
      <div className="w-1/4 bg-gray-100 border-r border-gray-300 p-4 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Students</h2>
        <input
          type="text"
          placeholder="Search by name or email"
          className="flex-1 p-2 border rounded-lg mb-2"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <ul>
          {conversations?.map((conversation) => (
            <li
              key={conversation?._id}
              className={`p-2 hover:bg-gray-200 mt-1 cursor-pointer rounded-lg 
                                    ${searchQuery !== "" ? "font-semibold" : ""}
                                    ${
                                      conversation?._id === currentStudent?._id
                                        ? "bg-gray-200 font-semibold"
                                        : ""
                                    }
                                    `}
              onClick={() =>
                handleStudentClick(
                  conversation?.participantDetails?.student?._id,
                  conversation?.participantDetails?.student,
                  conversation
                )
              }
            >
              {conversation?.participantDetails?.student?.Name}
              <br />
              <span className="text-sm font-semibold text-gray-500 flex justify-between pr-3">
                <span>
                  {conversation?.lastMessage?.senderType === "Student" ? (
                    <i className="mr-3"></i>
                  ) : (
                    <i class="fa-solid fa-check mr-3"> </i>
                  )}
                  {conversation?.lastMessage?.message || ""}
                  {isUserOnline(
                    conversation?.participantDetails?.student?._id
                  ) && <span className="ml-2 text-green-500">●</span>}
                </span>
                <span className="text-xs">
                  {new Date(conversation?.lastMessage?.timestamp)
                    .toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "numeric",
                      hour12: true,
                    })
                    .replace(/(AM|PM)/g, (match) => match.toUpperCase()) || ""}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="w-3/4 flex flex-col h-full relative">
        {currentStudent && (
          <div className="p-2 bg-blue-400 text-white text-lg font-semibold rounded flex flex-col">
            {currentStudent.Name}
            <span className="text-sm">{currentStudent.Email}</span>
          </div>
        )}
        <div className="flex-1 p-4 overflow-y-auto mb-20 bg-gray-100 max-h-[73vh]">
          {loadingMessages ? (
            <p className="mx-auto flex justify-center items-center mt-44 ">
              <Hourglass
                visible={true}
                height="30"
                width="30"
                ariaLabel="hourglass-loading"
                colors={["#306cce", "#72a1ed"]}
              />
            </p>
          ) : (
            <div className="messages flex flex-col">
              {Object.keys(groupedMessages)
                .sort((a, b) => new Date(a) - new Date(b))
                .map((date, index) => (
                  <div key={index} className="mb-4">
                    <div className="text-center text-gray-600 mb-2">
                      {format(new Date(date), "MMMM d, yyyy")}
                    </div>
                    <div className="flex flex-col gap-2">
                      {groupedMessages[date].map((msg, msgIndex) => (
                        <div
                          key={msgIndex}
                          className={`p-2 rounded-lg inline-block max-w-xs ${
                            msg.senderId === companyId
                              ? "bg-blue-200 self-end text-right"
                              : "bg-gray-200 text-left self-start"
                          }`}
                        >
                          <div>{msg.message}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(msg?.timestamp)
                              .toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "numeric",
                                hour12: true,
                              })
                              .replace(/(AM|PM)/g, (match) =>
                                match.toUpperCase()
                              ) || ""}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              <div ref={messagesEndRef}></div>
            </div>
          )}
        </div>
        <div className="border-gray-300 fixed bottom-10 w-3/4 mx-auto flex items-center justify-center">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="p-2 border rounded-lg w-3/4"
          />
          <button
            onClick={sendMessage}
            className="ml-5 bg-blue-500 text-white rounded-lg"
          >
            <i className="fa-solid fa-paper-plane p-3"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
