import React from "react";

import { IuploadedFile } from "../interfaces/interfaces";
import Divider from "./Divider";
export interface Iprops {
  uploadedFiles: Array<IuploadedFile>;
}

const UploadedFiles = (props: Iprops) => {
  const listItem = props.uploadedFiles.map(
    (item: IuploadedFile, index: number) => (
      <li
        key={index}
        style={{
          marginBottom: "10px",
        }}
      >
        <div>{item.fileName}</div>
        <a href={item.url}>{item.url}</a>
      </li>
    )
  );
  return (
    <div
      style={{
        width: "500px",
        margin: "auto",
        textAlign: "center",
        color: "green",
        padding: "10px",
        borderTop: "1px solid green",
        backgroundColor: "#fff",
        marginTop: "20px",
        display: `${props.uploadedFiles.length > 0 ? "block" : "none"}`,
      }}
    >
      <Divider
        text="已上传文件"
        margin="30px"
        color="green"
        lineColor="green"
      />
      <ul
        style={{
          padding: "0px",
          listStyle: "none",
          listStyleType: "none",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {listItem}
      </ul>
    </div>
  );
};

export default UploadedFiles;
