import styled from "styled-components";
import { useThemeStore } from "../../store/ThemeStore";
import { Icon } from "@iconify/react";

export function ToggleTema() {
  const { theme, setTheme } = useThemeStore();
  const isLight = theme === "light";

  return (
    <Container>
      <label className="toggle" aria-label="Cambiar tema">
        <input
          id="switch-theme"
          className="input"
          type="checkbox"
          checked={isLight}
          onChange={setTheme}
        />
        <span className="track">
          <span className="icon icon-moon">
            <Icon icon="solar:moon-stars-bold" />
          </span>
          <span className="icon icon-sun">
            <Icon icon="solar:sun-bold" />
          </span>
          <span className="thumb" />
        </span>
      </label>
    </Container>
  );
}

const Container = styled.div`
  justify-content: center;
  display: flex;

  .toggle {
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    margin-top: 15px;
    user-select: none;
  }

  .input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .track {
    width: 74px;
    height: 38px;
    border-radius: 999px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 11px;
    background: linear-gradient(135deg, #182230 0%, #0d141f 100%);
    border: 2px solid #000;
    box-shadow:
      inset 0 1px 1px rgba(255, 255, 255, 0.12),
      0 8px 18px rgba(0, 0, 0, 0.18);
    transition: background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
  }

  .icon {
    z-index: 1;
    width: 15px;
    height: 15px;
    display: inline-flex;
    color: rgba(255, 255, 255, 0.72);
    transition: color 0.3s ease, transform 0.3s ease, opacity 0.3s ease;
  }

  .thumb {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    position: absolute;
    top: 3px;
    left: 4px;
    background: linear-gradient(145deg, #f9fafb 0%, #e2e8f0 100%);
    box-shadow:
      0 5px 12px rgba(0, 0, 0, 0.2),
      inset 0 1px 1px rgba(255, 255, 255, 0.6);
    transition: transform 0.33s cubic-bezier(0.25, 1, 0.5, 1), background 0.3s ease;
  }

  #switch-theme:checked + .track {
    background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
    border-color: #000;
    box-shadow:
      inset 0 1px 1px rgba(255, 255, 255, 0.32),
      0 8px 18px rgba(249, 115, 22, 0.35);
  }

  #switch-theme:checked + .track .thumb {
    transform: translateX(35px);
    background: linear-gradient(145deg, #ffffff 0%, #fff6dc 100%);
  }

  #switch-theme:checked + .track .icon-sun {
    color: #ffffff;
    transform: scale(1.1);
  }

  #switch-theme:checked + .track .icon-moon {
    color: rgba(255, 255, 255, 0.5);
    opacity: 0.75;
  }

  #switch-theme:not(:checked) + .track .icon-moon {
    color: #ffffff;
    transform: scale(1.1);
  }

  #switch-theme:focus-visible + .track {
    outline: 2px solid rgba(255, 255, 255, 0.82);
    outline-offset: 3px;
  }
`;
