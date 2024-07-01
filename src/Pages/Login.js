import { TextField } from "@mui/material";
import * as React from "react";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  function onLogin() {
    navigate("/Home");
  }

  return (
    <div
      style={{ position: "relative", display: "grid", justifyItems: "center" }}
    >
      <img
        src={"Logo1.png"}
        alt="Descriere imagine"
        style={{ width: "80%", height: "auto" }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          transform: "translateY(-50%)",
          display: "grid",
          gap: "8px",
          justifyItems: "center",
        }}
      >
        <TextField id="outlined-name" label="Name" variant="outlined" />
        <TextField id="outlined-surname" label="Surname" variant="outlined" />
        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={onLogin}>
            Login
          </Button>
        </Stack>
      </div>
    </div>
  );
}
