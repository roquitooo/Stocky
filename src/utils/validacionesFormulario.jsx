function obtenerSoloDigitos(valor = "") {
  return String(valor ?? "").replace(/\D/g, "");
}

function tieneTodosLosDigitosIguales(valor = "") {
  return /^(\d)\1+$/.test(valor);
}

function tieneSecuenciaConsecutiva(valor = "") {
  if (valor.length < 6) return false;

  let ascendente = true;
  let descendente = true;

  for (let i = 1; i < valor.length; i += 1) {
    const actual = Number(valor[i]);
    const anterior = Number(valor[i - 1]);

    if (actual - anterior !== 1) ascendente = false;
    if (actual - anterior !== -1) descendente = false;
  }

  return ascendente || descendente;
}

export function normalizarTextoPlano(valor = "") {
  return String(valor ?? "").trim();
}

export function formatearIdentificadorNacionalVisual(valor = "") {
  const digitos = obtenerSoloDigitos(valor).slice(0, 8);

  if (!digitos) return "";

  return digitos.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatearBloquesTelefonoNacional(digitos = "") {
  if (!digitos) return "";
  if (digitos.length <= 4) return digitos;

  const ultimosCuatro = digitos.slice(-4);
  const encabezado = digitos.slice(0, -4);

  if (encabezado.length <= 4) {
    return `${encabezado}-${ultimosCuatro}`;
  }

  const areaLength = Math.max(2, Math.min(4, encabezado.length - 4));
  const area = encabezado.slice(0, areaLength);
  const numero = encabezado.slice(areaLength);

  return `${area} ${numero}-${ultimosCuatro}`.trim();
}

export function formatearTelefonoVisual(valor = "") {
  const texto = String(valor ?? "").trim();
  const digitos = obtenerSoloDigitos(texto).slice(0, 15);

  if (!digitos) return "";

  const tienePrefijoInternacional = texto.startsWith("+") || digitos.startsWith("54");

  if (tienePrefijoInternacional && digitos.startsWith("54")) {
    let resto = digitos.slice(2);
    let prefijoMovil = "";

    if (resto.startsWith("9")) {
      prefijoMovil = " 9";
      resto = resto.slice(1);
    }

    const telefonoFormateado = formatearBloquesTelefonoNacional(resto);
    return `+54${prefijoMovil}${telefonoFormateado ? ` ${telefonoFormateado}` : ""}`.trim();
  }

  return formatearBloquesTelefonoNacional(digitos);
}

export function normalizarTelefono(valor = "") {
  return String(valor ?? "")
    .replace(/[^\d+()\-\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizarIdentificadorNumerico(valor = "") {
  return obtenerSoloDigitos(valor);
}

export function formatearIdentificadorFiscalVisual(valor = "") {
  const digitos = obtenerSoloDigitos(valor).slice(0, 11);

  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 10) {
    return `${digitos.slice(0, 2)}-${digitos.slice(2)}`;
  }

  return `${digitos.slice(0, 2)}-${digitos.slice(2, 10)}-${digitos.slice(10)}`;
}

export function validarTelefono(valor = "") {
  const telefono = normalizarTelefono(valor);
  const digitos = obtenerSoloDigitos(telefono);

  if (!telefono) return "Campo requerido";
  if (digitos.length < 8 || digitos.length > 15) {
    return "Ingresa un telefono valido";
  }
  if (tieneTodosLosDigitosIguales(digitos) || tieneSecuenciaConsecutiva(digitos)) {
    return "Ingresa un telefono real";
  }

  return true;
}

export function validarIdentificadorNacional(valor = "") {
  const digitos = obtenerSoloDigitos(valor);

  if (!digitos) return "Campo requerido";
  if (digitos.length < 7 || digitos.length > 8) {
    return "Ingresa un DNI valido";
  }
  if (tieneTodosLosDigitosIguales(digitos) || tieneSecuenciaConsecutiva(digitos)) {
    return "Ingresa un identificador nacional real";
  }

  return true;
}

export function validarIdentificadorFiscal(valor = "") {
  const digitos = obtenerSoloDigitos(valor);
  const tiposValidos = new Set(["20", "23", "24", "27", "30", "33", "34"]);
  const multiplicadores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

  if (!digitos) return "Campo requerido";
  if (digitos.length !== 11) {
    return "Ingresa un CUIT/CUIL valido";
  }
  if (!tiposValidos.has(digitos.slice(0, 2))) {
    return "Ingresa un CUIT/CUIL valido";
  }
  if (tieneTodosLosDigitosIguales(digitos)) {
    return "Ingresa un identificador fiscal real";
  }

  const suma = multiplicadores.reduce(
    (acc, multiplicador, index) =>
      acc + Number(digitos[index]) * multiplicador,
    0
  );
  let digitoVerificador = 11 - (suma % 11);

  if (digitoVerificador === 11) digitoVerificador = 0;
  if (digitoVerificador === 10) digitoVerificador = 9;

  if (digitoVerificador !== Number(digitos[10])) {
    return "Ingresa un CUIT/CUIL valido";
  }

  return true;
}
