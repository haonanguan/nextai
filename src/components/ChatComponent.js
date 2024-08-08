import React, { useState, useEffect } from "react"; // Import useState
import axios from "axios";
import { Button, Input } from "antd";
import { AudioOutlined } from "@ant-design/icons";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import Speech from "speak-tts";

const { Search } = Input;

const DOMAIN = "http://localhost:8080";

const searchContainer = {
    display: "flex",
    justifyContent: "center",
};

const ChatComponent = (props) => {
    const { handleResp, isLoading, setIsLoading, setConversation } = props;
    const [searchValue, setSearchValue] = useState("");

    const [isChatModeOn, setIsChatModeOn] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [speech, setSpeech] = useState();

    // speech recognation i.e. Speech To Text
    const {
        transcript, //update automatically whenever someone talks, because this is a hook
        listening,
        resetTranscript,
        // eslint-disable-next-line no-unused-vars
        browserSupportsSpeechRecognition,
        // eslint-disable-next-line no-unused-vars
        isMicrophoneAvailable,
    } = useSpeechRecognition();

    //init speech
    useEffect(() => {
        const speech = new Speech();
        speech
            .init({
                volume: 1,
                lang: "en-US",
                rate: 1,
                pitch: 1,
                voice: "Google US English",
                splitSentences: true,
            })
            .then((data) => {
                // The "data" object contains the list of available voices and the voice synthesis params
                console.log("Speech is ready, voices are available", data);
                setSpeech(speech);
            })
            .catch((e) => {
                console.error("An error occured while initializing : ", e);
            });
    }, []);

    //everytime user complete talk, update onSearch
    useEffect(() => {
        if (!listening && !!transcript) {
            //IIFE
            (async () => await onSearch(transcript))();
            setIsRecording(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [listening, transcript]);

    const talk = (what2say) => {
        speech
            .speak({
                text: what2say,
                queue: false, // current speech will be interrupted,
                listeners: {
                    onstart: () => {
                        console.log("Start utterance");
                    },
                    onend: () => {
                        console.log("End utterance");
                    },
                    onresume: () => {
                        console.log("Resume utterance");
                    },
                    onboundary: (event) => {
                        console.log(
                            event.name +
                                " boundary reached after " +
                                event.elapsedTime +
                                " milliseconds."
                        );
                    },
                },
            })
            .then(() => {
                // if everyting went well, start listening again
                console.log("Success !");
                userStartConvo();
            })
            .catch((e) => {
                console.error("An error occurred :", e);
            });
    };

    //make sure the conversation could be back and forth, talk is from AI, userStartConvo is from User
    const userStartConvo = () => {
        SpeechRecognition.startListening();
        setIsRecording(true);
        resetEverything();
    };

    //clean the talk information from last conversation
    const resetEverything = () => {
        resetTranscript();
    };

    const chatModeClickHandler = () => {
        setIsChatModeOn(!isChatModeOn);
        //case1: before you click the button, it's recording
        //case2: before you click the button, it's not recording
        setIsRecording(false);
        SpeechRecognition.stopListening();
    };

    const recordingClickHandler = () => {
        if (isRecording) {
            setIsRecording(false);
            SpeechRecognition.stopListening();
        } else {
            setIsRecording(true);
            SpeechRecognition.startListening();
        }
    };

    const onSearch = async (question) => {
        //clear the search input
        setSearchValue("");
        setIsLoading(true);
        setConversation((prev) => [...prev, { question, answer: "" }]);
        try {
            const response = await axios.get(`${DOMAIN}/chat`, {
                params: {
                    question,
                },
            });
            handleResp(question, response.data);
            if (isChatModeOn) {
                talk(response.data);
            }
        } catch (error) {
            console.error(`Error: ${error}`);
            handleResp(question, error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        // Update searchValue state when the user types in the input box
        setSearchValue(e.target.value);
    };

    return (
        <div style={searchContainer}>
            {!isChatModeOn && (
                <Search
                    placeholder="input search text"
                    enterButton="Ask"
                    size="large"
                    onSearch={onSearch}
                    loading={isLoading}
                    value={searchValue} // Control the value
                    onChange={handleChange} // Update the value when changed
                />
            )}
            <Button
                type="primary"
                size="large"
                danger={isChatModeOn}
                onClick={chatModeClickHandler}
                style={{ marginLeft: "5px" }}
            >
                Chat Mode: {isChatModeOn ? "On" : "Off"}
            </Button>
            {isChatModeOn && (
                <Button
                    type="primary"
                    icon={<AudioOutlined />}
                    size="large"
                    danger={isRecording}
                    onClick={recordingClickHandler}
                    style={{ marginLeft: "5px" }}
                >
                    {isRecording ? "Recording..." : "Click to record"}
                </Button>
            )}
        </div>
    );
};

export default ChatComponent;
