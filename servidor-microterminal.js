const net = require('net');
const http = require('http');

// Código para limpar a tela
const CLEAR_SCREEN = '\x1B[2J\x1B[0;0f';
const MOVE_CURSOR = (x, y) => `\x1B[${y};${x}H`;

// Função para consultar saldo
async function consultarSaldo(codigo) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost/api/saldo?codigo=${codigo}`, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const resposta = JSON.parse(data);
          resposta.error ? reject(resposta.error) : resolve(resposta.saldo);
        } catch (e) {
          reject('Erro ao processar resposta');
        }
      });
    }).on('error', () => reject('Erro na requisição'));
  });
}

const server = net.createServer((socket) => {
  let bufferCodigo = '';
  let modo = 'codigo';

  function exibirTelaInicial() {
    socket.write(CLEAR_SCREEN);
    socket.write(' CONSULTA DE SALDO\r\n'); // Ajustado alinhamento
    socket.write('Codigo: ');
  }

  exibirTelaInicial();

  socket.on('data', async (data) => {
    const input = data.toString().trim();
    
    if (modo === 'codigo') {
      if (input === '' && bufferCodigo.length > 0) {
        try {
          socket.write(CLEAR_SCREEN);
          socket.write('Consultando...\r\n');
          const saldo = await consultarSaldo(bufferCodigo);
          socket.write(CLEAR_SCREEN);
          socket.write(` Codigo: ${bufferCodigo}\r\n`);
          socket.write(`Saldo: ${saldo}\r\n\r\n`);
          socket.write('ENTER para voltar');
          modo = 'voltar';
        } catch (erro) {
          socket.write(CLEAR_SCREEN);
          socket.write(' ERRO NA CONSULTA\r\n');
          socket.write(`${erro}\r\n\r\n`);
          socket.write('ENTER para voltar');
          modo = 'voltar';
        }
        bufferCodigo = '';
      } else if (input !== '') {
        if (input === '\b') { // Backspace no terminal
          bufferCodigo = bufferCodigo.slice(0, -1);
        } else {
          bufferCodigo += input;
        }
        socket.write(MOVE_CURSOR(9, 2));
        socket.write(bufferCodigo.padEnd(20, ' '));
      }
    } else if (modo === 'voltar' && input === '') {
      exibirTelaInicial();
      modo = 'codigo';
    }
  });

  socket.on('error', () => console.log('Erro na conexão'));
});

server.listen(5000, () => console.log('Servidor TCP iniciado na porta 5000'));