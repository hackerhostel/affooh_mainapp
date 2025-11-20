import React from "react";
import {Mention, MentionsInput} from "react-mentions";

const MentionInput = ({value = '', onchange, placeholder = '', tasks = [], users = []}) => {

    const inputStyle = {
        width: "100%",
        borderRadius: "0.5rem",
        border: "1px solid #d1d5db",
        outline: "none",
        backgroundColor: "#ffffff",
        padding: "0.5rem",
    };

    return (
        <div className="w-full">
            <MentionsInput
                value={value}
                onChange={(e) => onchange(e.target.value)}
                placeholder={placeholder}
                style={{
                    ...inputStyle,
                    highlighter: {backgroundColor: "transparent"},
                    input: {
                        margin: 0,
                        paddingTop: '8px',
                        paddingLeft: '10px',
                        paddingRight: '10px',
                        color: '#747A88',
                        borderRadius: '0.5rem',
                        borderColor: '#EB5A84'
                    },
                    suggestions: {
                        border: 'solid 1px',
                        borderRadius: '0.5rem',
                        borderColor: 'black',
                        maxHeight: "350px",
                        overflowY: "auto",
                    }
                }}
            >
                <Mention
                    trigger="@"
                    data={users}
                    renderSuggestion={(entry) => (
                        <div
                            className="px-4 py-2 bg-task-status-qa hover:bg-gray-100 cursor-pointer border-b border-gray-500 shadow-md hover:border-blue-500">{entry.display}</div>
                    )}
                    markup="@{{__id__||__display__}}"
                />
                <Mention
                    trigger="#"
                    data={tasks}
                    renderSuggestion={(entry) => (
                        <div
                            className="px-4 py-2 bg-task-status-done hover:bg-gray-100 cursor-pointer border-b border-gray-500 shadow-md hover:border-blue-500">{entry.display}</div>
                    )}
                    markup="#{{__id__||__display__}}"
                />
            </MentionsInput>
        </div>
    );
};

export default MentionInput;
