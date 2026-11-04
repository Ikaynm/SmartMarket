export function mensagemErro(erro: unknown): string {
  const codigo = (erro as { code?: string })?.code;
  switch (codigo) {
    case 'auth/invalid-email': return 'Digite um e-mail válido.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found': return 'E-mail ou senha incorretos.';
    case 'auth/email-already-in-use': return 'Este e-mail já está cadastrado.';
    case 'auth/weak-password': return 'A senha precisa ter pelo menos 6 caracteres.';
    case 'auth/too-many-requests': return 'Muitas tentativas. Tente novamente mais tarde.';
    case 'auth/network-request-failed':
    case 'unavailable': return 'Sem conexão no momento. Confira sua internet.';
    case 'permission-denied': return 'Sem permissão. Confira as regras do Firestore.';
    case 'failed-precondition': return 'A operação não pôde ser concluída. Confira o Firestore.';
    default: return 'Ocorreu um erro. Tente novamente.';
  }
}
