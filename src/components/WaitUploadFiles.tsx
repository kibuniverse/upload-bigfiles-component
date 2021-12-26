import React from "react";
import { IwaitUploadFile } from "../interfaces/interfaces";
import FileUploadStatusBox from "./FileUploadStatusBox";
export interface Iprops {
  waitUploadFiles: Array<IwaitUploadFile>;
}
export default function WaitUploadFiles(props: Iprops) {
  const listItem = props.waitUploadFiles.map(
    (item: IwaitUploadFile, index: number) => (
      <li key={item.id}>
        <FileUploadStatusBox waitUploadFile={item} />
      </li>
    )
  );
  return (
    <div
      style={{
        width: "400px",
        margin: "auto",
        borderRadius: "10px",
        textAlign: "center",
        color: "blue",
        padding: "10px",
        border: "1px solid #5099ed",
        backgroundColor: "#fff",
        marginTop: "20px",
        transition: "all 1s",
        display: `${props.waitUploadFiles.length > 0 ? "block" : "none"}`,
      }}
    >
      <ul
        style={{
          padding: "0px",
          listStyle: "none",
        }}
      >
        {listItem}
      </ul>
    </div>
  );
}
