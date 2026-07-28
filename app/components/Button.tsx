"use client";

import { ButtonHTMLAttributes } from "react";

export default function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { style, onMouseDown, onMouseUp, onMouseLeave, ...rest } = props;

  return (
    <button
      {...rest}
      style={{
        padding: "10px 20px",
        borderRadius: "999px",
        border: "2px solid #000",
        background: "#fff",
        color: "#000",
        fontWeight: 700,
        fontSize: "13px",
        textTransform: "uppercase",
        letterSpacing: "0.02em",
        cursor: "pointer",
        boxShadow: "4px 4px 0px #000",
        transition: "box-shadow 0.1s, transform 0.1s",
        ...style, // lets a specific button override/add styles if ever needed
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.boxShadow = "1px 1px 0px #000";
        e.currentTarget.style.transform = "translate(3px, 3px)";
        onMouseDown?.(e);
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.boxShadow = "4px 4px 0px #000";
        e.currentTarget.style.transform = "translate(0, 0)";
        onMouseUp?.(e);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "4px 4px 0px #000";
        e.currentTarget.style.transform = "translate(0, 0)";
        onMouseLeave?.(e);
      }}
    />
  );
}