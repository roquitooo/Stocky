import styled from "styled-components";
import { Btn1, Footer, InputText2, Title, useAuthStore, Linea } from "../../index";
import { Device } from "../../styles/breakpoints";
import logo from "../../assets/logo.svg";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";

export function LoginTemplate() {
  const navigate = useNavigate();
  const { loginGoogle, loginEmailPass } = useAuthStore();

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault(); // ✅ evita el “reinicio”
    setLoading(true);
    try {
      await loginEmailPass({ email: email.trim(), password: pass });
      toast.success("Sesión iniciada");
      navigate("/");
    } catch (err) {
      toast.error(err?.message ?? "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <div className="card">
        <img className="logo" src={logo} alt="Logo Stocky" height="100px" />
        <Title>BIENVENIDO A STOCKY</Title>

        <form onSubmit={onSubmit}>
          <InputText2>
            <input
              className="form__field"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </InputText2>

          <InputText2>
            <input
              className="form__field"
              placeholder="Contraseña"
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              autoComplete="current-password"
            />
          </InputText2>

          <Btn1
            titulo={loading ? "Ingresando..." : "INGRESAR"}
            bgcolor="#ffc400"
            color="1,1,1"
            width="100%"
            disabled={loading || !email || !pass}
          />
        </form>

        <Linea>
          <span>o</span>
        </Linea>

        <Btn1
          funcion={loginGoogle}
          titulo="Google"
          bgcolor="#fff"
          icono={<Icon icon="flat-color-icons:google" />}
          disabled={loading}
        />
      </div>

      <Footer />
    </Container>
  );
}

const Container = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  flex-direction: column;
  padding: 0 10px;
  color: ${({ theme }) => theme.text};

  .card {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
    width: 100%;
    margin: 20px;

    @media ${Device.tablet} {
      width: 400px;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
  }
`;
