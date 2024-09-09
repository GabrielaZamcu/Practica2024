import {
  TextField,
  Button,
  Stack,
  Switch,
  FormControlLabel,
  Typography,
} from "@mui/material";
import * as React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleFormSubmit() {
    setErrorMessage("");
    if (isSignUp) {
      try {
        const response = await axios.post("/users", {
          username: username,
          password: password,
          email: email,
          role: role,
        });

        if (response.status === 201) {
          console.log("Utilizator creat:", response.data);
          navigate("/Home", { state: { role: response.data.role } });
        } else {
          setErrorMessage(
            "Eroare la crearea utilizatorului. Vă rugăm să încercați din nou."
          );
        }
      } catch (error) {
        console.error("Eroare la crearea utilizatorului", error);
        setErrorMessage(
          "Eroare la crearea utilizatorului. Vă rugăm să încercați din nou."
        );
      }
    } else {
      try {
        const response = await axios.post("/users/login", {
          email: email,
          password: password,
        });

        if (
          (response.status === 200 || response.status === 201) &&
          response.data._id
        ) {
          console.log("Utilizator autentificat:", response.data);
          localStorage.setItem("userId", response.data._id);
          localStorage.setItem("username", response.data.username);
          localStorage.setItem("password", response.data.password);
          localStorage.setItem("email", response.data.email);
          localStorage.setItem("role", response.data.role);

          navigate("/Home", { state: { role: response.data.role } });
        } else {
          setErrorMessage("Utilizator indisponibil sau parolă incorectă.");
        }
      } catch (error) {
        console.error("Eroare la autentificare", error);
        setErrorMessage(
          "Eroare la autentificare. Vă rugăm să încercați din nou."
        );
      }
    }
  }

  return (
    <div style={{ position: "relative", height: "100vh", overflow: "hidden" }}>
      <img
        src={"Logo1.png"}
        alt="Descriere imagine"
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: -1,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "60%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "grid",
          gap: "16px",
          justifyItems: "center",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          padding: "32px",
          borderRadius: "8px",
        }}
      >
        <FormControlLabel
          control={
            <Switch
              checked={isSignUp}
              onChange={() => {
                setIsSignUp(!isSignUp);
                setErrorMessage(""); // Șterge mesajul de eroare la schimbare
              }}
            />
          }
          label={
            isSignUp ? "Comutare la Autentificare" : "Comutare la Înregistrare"
          }
        />
        {isSignUp ? (
          <>
            <TextField
              id="outlined-username"
              label="Nume utilizator"
              variant="outlined"
              required
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              id="outlined-password"
              label="Parolă"
              variant="outlined"
              type="password"
              required
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              id="outlined-email"
              label="Email"
              variant="outlined"
              required
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              id="outlined-role"
              label="Rol"
              variant="outlined"
              required
              onChange={(e) => setRole(e.target.value)}
            />
          </>
        ) : (
          <>
            <TextField
              id="outlined-username"
              label="Email"
              variant="outlined"
              required
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              id="outlined-password"
              label="Parolă"
              variant="outlined"
              type="password"
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </>
        )}
        {errorMessage && <Typography color="error">{errorMessage}</Typography>}
        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={handleFormSubmit}>
            {isSignUp ? "Înregistrare" : "Autentificare"}
          </Button>
        </Stack>
      </div>
    </div>
  );
}
