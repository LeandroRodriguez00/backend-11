const bcrypt = require('bcryptjs');

(async () => {
  const password = 'rodriguez1234';

  // Genera el hash de la contraseña
  const hash = await bcrypt.hash(password, 10);
  console.log('Hash generado:', hash);

  // Compara la contraseña original con el hash recién generado
  const isMatch = await bcrypt.compare(password, hash);
  console.log('Resultado de la comparación manual con el nuevo hash:', isMatch);
})();