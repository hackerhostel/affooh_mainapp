import React from "react";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';

const WYSIWYGInput = ({ value = '', name = '', onchange }) => {
    const modules = {
        toolbar: [
            [{ font: [] }],
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
            [
                { list: 'ordered' },
                { list: 'bullet' },
                { indent: '-1' },
                { indent: '+1' }
            ],
            ['link'],
            [{ color: [] }, { background: [] }],
            [{ align: [] }],
            [{ direction: 'rtl' }],
            ['clean']
        ]
    };

    const formats = [
        'header',
        'font',
        'bold',
        'italic',
        'underline',
        'strike',
        'blockquote',
        'list',
        'bullet',
        'indent',
        'link',
        'color',
        'background',
        'align',
        'direction'
    ];

    return (
        <div className="w-full">
            <ReactQuill
                theme="snow"
                value={value}
                onChange={(value) => onchange(name, value)}
                modules={modules}
                formats={formats}
            />
        </div>
    );
};

export default WYSIWYGInput;