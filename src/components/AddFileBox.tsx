import React from "react";

type IProps = {
  handleFileChange(e: any): void;
};

export default function AddFileBox(props: IProps) {
  return (
    <div
      style={{
        width: "400px",
        border: "2px solid gray",
        borderStyle: "dashed",
        borderRadius: "2%",
        position: "relative",
        backgroundColor: "#f9f9f9",
        margin: "100px auto 20px auto",
        backgroundImage:
          'url("http://49.234.79.241:8001/ddad1a4c0164ed53590ffeb51d0a1a72.png")',
        backgroundSize: "cover",
      }}
    >
      <input
        style={{
          width: "400px",
          height: "200px",
          opacity: "0",
        }}
        type="file"
        onChange={props.handleFileChange}
        multiple
      />
    </div>
  );
}
