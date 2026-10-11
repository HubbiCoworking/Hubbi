const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const onlyDigits = (v: string): string => v.replace(/\D/g, '');

export function emailError(value: string): string {
  const v = value.trim();
  if (!v) return 'Digite seu e-mail.';
  if (!EMAIL.test(v)) return 'Confira o e-mail. Ele precisa ter @ e domínio, como nome@email.com.';
  return '';
}

export function isValidCpf(d: string): boolean {
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
  for (let t = 9; t < 11; t++) {
    let sum = 0;
    for (let i = 0; i < t; i++) sum += Number(d[i]) * (t + 1 - i);
    if (((sum * 10) % 11) % 10 !== Number(d[t])) return false;
  }
  return true;
}

export function isValidCnpj(d: string): boolean {
  if (d.length !== 14 || /^(\d)\1+$/.test(d)) return false;
  const digit = (n: number): number => {
    let sum = 0;
    let weight = n - 7;
    for (let i = 0; i < n; i++) {
      sum += Number(d[i]) * weight--;
      if (weight < 2) weight = 9;
    }
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };
  return digit(12) === Number(d[12]) && digit(13) === Number(d[13]);
}

/** Máscara de CPF (até 11 dígitos) ou CNPJ (12 a 14 dígitos). */
export function maskDocument(value: string): string {
  const d = onlyDigits(value).slice(0, 14);
  if (d.length <= 11) {
    return d
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
  }
  return d
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

/** Máscara de telefone com DDD: (11) 1234-5678 ou (11) 91234-5678. */
export function maskPhone(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function documentError(value: string): string {
  const d = onlyDigits(value);
  if (!d) return 'Digite seu CPF ou CNPJ.';
  if (d.length !== 11 && d.length !== 14) return 'O CPF tem 11 números e o CNPJ tem 14. Confira o que falta.';
  if (d.length === 11 && !isValidCpf(d)) return 'Esse CPF não é válido. Confira os números.';
  if (d.length === 14 && !isValidCnpj(d)) return 'Esse CNPJ não é válido. Confira os números.';
  return '';
}

export function phoneError(value: string): string {
  const d = onlyDigits(value);
  if (!d) return 'Digite seu celular com DDD.';
  if (d.length < 10) return 'Digite o número com DDD, como (11) 91234-5678.';
  return '';
}

export function nameError(value: string): string {
  const v = value.trim();
  if (!v) return 'Digite seu nome completo.';
  if (v.split(/\s+/).length < 2) return 'Digite nome e sobrenome.';
  return '';
}

/** Regras de senha do cadastro (FR-019 e data-model.md). */
export const passwordRules = [
  { id: 'len', label: '8 caracteres ou mais', test: (v: string) => v.length >= 8 },
  { id: 'let', label: 'Uma letra', test: (v: string) => /[A-Za-zÀ-ÿ]/.test(v) },
  { id: 'num', label: 'Um número', test: (v: string) => /\d/.test(v) },
] as const;

export function newPasswordError(value: string): string {
  if (!value) return 'Crie uma senha.';
  return passwordRules.every((r) => r.test(value))
    ? ''
    : 'A senha precisa ter 8 caracteres ou mais, com pelo menos uma letra e um número.';
}
