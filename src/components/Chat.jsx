// src/components/Chat.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Dialog,
  IconButton,
  Tooltip,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import Picker from '@emoji-mart/react';

import { format, isToday, isYesterday } from "date-fns";
import data from '@emoji-mart/data';
import { auth, database } from "../firebase";
import { signOut } from "firebase/auth";
import { ref, onValue, push, update, remove } from "firebase/database";
import { generateChatId } from "../utils/generateChatId";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ShareIcon from "@mui/icons-material/Share";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ImageIcon from "@mui/icons-material/Image";
import AudiotrackIcon from "@mui/icons-material/Audiotrack";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import '@react-pdf-viewer/core/lib/styles/index.css';
import PersonIcon from "@mui/icons-material/Person";
import Avatar from "@mui/material/Avatar";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Menu, MenuItem } from "@mui/material";

const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

const Chat = ({ user, students }) => {
  const [currentRecipient, setCurrentRecipient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [isAttachPopupOpen, setAttachPopupOpen] = useState(false);
  const fileInputRef = useRef();
  const messagesEndRef = useRef(null);
  const [isEmojiPickerOpen, setEmojiPickerOpen] = useState(false);

  // Function to copy message to clipboard
const handleCopyMessage = (message) => {
  navigator.clipboard.writeText(message.content).then(() => {
    alert("Message copied!");
  });
};

// Function to delete a message
const handleDeleteMessage = async () => {
  if (!editingMessage) return;
  const chatId = generateChatId(user.uid, currentRecipient.id);
  const messageRef = ref(database, `messages/${chatId}/${editingMessage.id}`);

  try {
    await remove(messageRef);
    setEditingMessage(null);
    setContextMenu(null);
  } catch (error) {
    console.error("Error deleting message:", error);
  }
};

  const groupMessagesByDate = (messages) => {
    const grouped = {};
    messages.forEach((msg) => {
      const messageDate = new Date(msg.timestamp);
      let dateKey = format(messageDate, "yyyy-MM-dd");
  
      if (isToday(messageDate)) {
        dateKey = "Today";
      } else if (isYesterday(messageDate)) {
        dateKey = "Yesterday";
      } else {
        dateKey = format(messageDate, "MMMM dd, yyyy"); // Example: February 10, 2025
      }
  
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(msg);
    });
  
    return grouped;
  };
  
  const groupedMessages = groupMessagesByDate(messages);
  

  useEffect(() => {
    if (currentRecipient) {
      const chatId = generateChatId(user.uid, currentRecipient.id);
      const messagesRef = ref(database, `messages/${chatId}`);
      onValue(messagesRef, (snapshot) => {
        const data = snapshot.val();
        const messagesArray = data
          ? Object.entries(data).map(([id, value]) => ({ id, ...value }))
          : [];
        setMessages(messagesArray);
      });
    }
  }, [currentRecipient, user.uid]);

  // Scroll to the bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const uploadFileToCloudinary = async (file, fileType) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      if (data.secure_url) {
        return data.secure_url;
      } else {
        throw new Error("Failed to upload file.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file. Please try again.");
      return null;
    }
  };

  const handleEmojiSelect = (emoji) => {
    setMessage((prevMessage) => prevMessage + emoji.native);
    setEmojiPickerOpen(false);
  };


  const handleSendMessage = async () => {
    if (!message.trim() && !file) return;

    const chatId = generateChatId(user.uid, currentRecipient.id);
    const messageRef = ref(database, `messages/${chatId}`);
    let newMessage = {
      sender: user.uid,
      content: message,
      timestamp: Date.now(),
    };

    if (file) {
      const fileURL = await uploadFileToCloudinary(file, fileType);
      if (fileURL) {
        newMessage = {
          ...newMessage,
          file: fileURL,
          fileType,
          content: "",
        };
      }
      setFile(null);
      setFileType(null);
    }

    await push(messageRef, newMessage);
    setMessage("");
  };

  const handleAttachFileClick = () => {
    setAttachPopupOpen(true);
  };

  const handleClosePopup = () => {
    setAttachPopupOpen(false);
  };

  const getFileInputAcceptType = (type) => {
    switch (type) {
      case "image":
        return "image/*";
      case "audio":
        return "audio/*";
      case "video":
        return "video/*";
      case "document":
        return ".pdf, .doc, .docx, .zip";
      case "zip":
        return ".zip";
      default:
        return "*/*";
    }
  };


  const handleFileTypeSelection = (type) => {
    setFileType(type);
    fileInputRef.current.accept = getFileInputAcceptType(type);
    fileInputRef.current.click();
    setAttachPopupOpen(false);
  };


  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  return (
    <Box>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Chat App
          </Typography>
          <Typography variant="body2" sx={{ marginRight: 2 }}>
            {user.email}
          </Typography>
          <Button color="inherit" onClick={() => signOut(auth)}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Box display="flex" height="100vh">
        <Box width="25%" bgcolor="#f4f4f4" borderRight="1px solid #ddd">
          <Typography variant="h6" sx={{ p: 2 }}>
            Students
          </Typography>
          <List>
            {students.map(({ id, name, imageUrl }) => (
              <ListItem
                button
                key={id}
                selected={currentRecipient?.id === id}
                onClick={() => setCurrentRecipient({ id, name, imageUrl })}
              >
                <Avatar
                  src={imageUrl || ""}
                  sx={{ width: 40, height: 40, marginRight: 1 }}
                >
                  {!imageUrl && <PersonIcon />}
                </Avatar>
                <ListItemText primary={name} />
              </ListItem>
            ))}
          </List>
        </Box>
        <Box flex={1} p={2} >
          {currentRecipient ? (
            <>
              <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Avatar src={currentRecipient?.imageUrl || ""} sx={{ width: 30, height: 30 }}>
                  {!currentRecipient?.imageUrl && <PersonIcon />}
                </Avatar>
                Chat with {currentRecipient?.name}
              </Typography>

              <Box
                sx={{
                  height: "70vh",
                  overflowY: "auto",
                  backgroundColor: "#e9ecef",
                  padding: 2,
                  borderRadius: 2,
                }}
              >
                {Object.entries(groupedMessages).map(([date, msgs]) => (
                  <Box key={date}>
                    <Typography variant="subtitle2" sx={{ textAlign: "center", my: 1, color: "gray" }}>
                      {date}
                    </Typography>
                    {msgs.map((msg) => (
                      <Box
                        key={msg.id}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: msg.sender === user.uid ? "flex-end" : "flex-start",
                          mb: 1,
                        }}
                      >
                        <Box
                          sx={{
                            bgcolor: msg.sender === user.uid ? "#1976d2" : "#f1f1f1",
                            color: msg.sender === user.uid ? "#fff" : "#000",
                            p: 1,
                            borderRadius: 2,
                            maxWidth: "60%",
                          }}
                        >
                          {msg.content}
                          {msg.file && (
                        <a href={msg.file} download>
                          {msg.fileType === "image" && (
                            <img
                              src={msg.file}
                              alt="File"
                              style={{
                                width: "200px",
                                marginTop: "10px",
                                borderRadius: "5px",
                                cursor: "pointer",
                              }}
                            />
                          )}
                            {msg.fileType === "audio" && (
                              <audio controls style={{ marginTop: "10px" }}>
                                <source src={msg.file} />
                              </audio>
                            )}
                            {msg.fileType === "video" && (
                              <video
                                controls
                                style={{
                                  width: "200px",
                                  marginTop: "10px",
                                  borderRadius: "5px",
                                }}
                              >
                                <source src={msg.file} />
                              </video>
                            )}
                            {msg.fileType === "document" && (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  mt: 1,
                                  p: 1,
                                  bgcolor: "#fff",
                                  borderRadius: "5px",
                                  border: "1px solid #ddd",
                                }}
                              >
                                <InsertDriveFileIcon sx={{ mr: 1 }} />
                                Document
                              </Box>
                            )}
                          </a>
                        )}
                          <Typography variant="caption" sx={{ display: "block", textAlign: "right", mt: 1, color: "gray" }}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                  
                ))}
                <div ref={messagesEndRef}></div>
              </Box>

                
              

              <Box display="flex" alignItems="center">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.zip"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
                <Tooltip title="Emoji" arrow>
                  <IconButton onClick={() => setEmojiPickerOpen(!isEmojiPickerOpen)}>
                    😊
                  </IconButton>
                </Tooltip>
                {isEmojiPickerOpen && (
                  <Box sx={{ position: "absolute", bottom: "60px" }}>
                    <Picker data={data} onEmojiSelect={handleEmojiSelect} />
                  </Box>
                )}
                <Tooltip title="Attach File" arrow>
                  <IconButton onClick={handleAttachFileClick}>
                    <AttachFileIcon />
                  </IconButton>
                </Tooltip>
                <Box sx={{ flexGrow: 1, mx: 2 }}>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message"
                    style={{ width: "100%", padding: "10px", borderRadius: "5px" }}
                  />
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSendMessage}
                >
                  Send
                </Button>
              </Box>
              {/* Attach Popup */}
              <Dialog open={isAttachPopupOpen} onClose={handleClosePopup}>
                <DialogTitle>Select File Type</DialogTitle>
                <DialogContent>
                  <Box display="flex" justifyContent="space-around" mt={2}>
                    <Tooltip title="Attach Image">
                      <IconButton onClick={() => handleFileTypeSelection("image")}>
                        <ImageIcon fontSize="large" color="primary" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Attach Audio">
                      <IconButton onClick={() => handleFileTypeSelection("audio")}>
                        <AudiotrackIcon fontSize="large" color="secondary" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Attach Video">
                      <IconButton onClick={() => handleFileTypeSelection("video")}>
                        <VideoLibraryIcon fontSize="large" color="action" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Attach Document">
                      <IconButton onClick={() => handleFileTypeSelection("document")}>
                        <InsertDriveFileIcon fontSize="large" color="disabled" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleClosePopup}>Cancel</Button>
                </DialogActions>
              </Dialog>



              <input
                type="file"
                ref={fileInputRef}
                accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.zip"
                style={{ display: "none" }}
                multiple
                onChange={handleFileChange}
              />
            

            </>

            
          ) : (
            <Typography variant="h6">Select a student to chat with</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Chat;