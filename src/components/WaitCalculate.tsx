import React from "react";

import { IwaitCalculateFile } from "../interfaces/interfaces";

export interface Iprops {
  files: Array<IwaitCalculateFile>;
}

const WaitCalculateFiles = (props: Iprops) => {
  const listItem = props.files.map((item: IwaitCalculateFile) => (
    <li key={item.id}>{item.file.name}</li>
  ));
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
        backgroundColor: "#b8d7fb",
        display: `${props.files.length > 0 ? "block" : "none"}`,
      }}
    >
      <p>正在计算以下文件哈希，请稍等</p>
      <ul
        style={{
          listStyle: "none",
          padding: "0px",
        }}
      >
        {listItem}
      </ul>
    </div>
  );
};
export default WaitCalculateFiles;
