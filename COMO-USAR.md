# Como usar este site para uma nova pizzaria

Este guia é para quem nunca programou. Vamos passo a passo.

Este site tem **um único arquivo** onde você edita as informações da pizzaria:

```
config/pizzeria.json
```

Você edita esse arquivo, roda um comando, e o site inteiro (título da aba, cores,
cardápio, entrega, redes sociais) se atualiza sozinho. Você **não precisa** editar
HTML, CSS ou JavaScript.

---

## 1. Abra o arquivo de configuração

Abra `config/pizzeria.json` em qualquer editor de texto (o VS Code, que você já
deve ter aberto, serve perfeitamente).

É um arquivo de texto com "campos" tipo `"nome": "valor"`. Você só troca o que
está depois dos dois pontos, **entre aspas**. Não apague as aspas, as vírgulas
nem as chaves `{ }` e colchetes `[ ]` — só o texto/número dentro deles.

### Campos que você provavelmente vai editar

**`brand`** — identidade da pizzaria
```json
"brand": {
  "name": "Fedrizzi Pizza",
  "tagline": "Handcrafted artisan pizzas, made fresh to order.",
  "color": "#e5462c"
}
```
- `name`: o nome que aparece no topo do site, na aba do navegador e no Google.
- `tagline`: uma frase curta que aparece nas prévias do Google/WhatsApp.
- `color`: a cor principal da marca, em formato hexadecimal (o código de 6
  letras/números que começa com `#`). Se você não sabe o código da sua cor, use
  um "seletor de cor" (procure "color picker" no Google) e copie o valor que
  começa com `#`. **Todas as outras variações dessa cor no site** (botões,
  destaques, bordas) são calculadas automaticamente a partir dessa única cor —
  é aqui que você troca a identidade visual inteira do site.

**`contact`** — dados de contato (usados na busca do Google)
```json
"contact": {
  "phone": null,
  "email": null,
  "address": null,
  "openingHours": null
}
```
`null` quer dizer "vazio, ainda não preenchido". Troque `null` por um texto entre
aspas quando tiver a informação, por exemplo: `"phone": "+353 1 234 5678"`.

**`social`** — links das redes sociais
```json
"social": {
  "instagram": null,
  "facebook": null,
  "google": null,
  "whatsapp": null
}
```
Troque `null` pelo link completo, por exemplo:
`"instagram": "https://instagram.com/suapizzaria"`. Enquanto estiver `null`, o
ícone aparece apagado/desabilitado no rodapé do site (é assim de propósito).

**`delivery`** — taxa e tempo de entrega
```json
"delivery": {
  "baseFee": 3.5,
  "standardRadiusKm": 10,
  "extraFeePerKm": 0.75,
  "deliveryEta": "30–40 min",
  "collectionEta": "15–20 min"
}
```
Números **não levam aspas** (`3.5`, não `"3.5"`). Textos como o tempo estimado
levam aspas.

**`sizes`** — tamanhos de pizza e preços
```json
"sizes": [
  { "key": "Small", "slices": 4, "price": 18 },
  { "key": "Medium", "slices": 8, "price": 22 },
  { "key": "Large", "slices": 12, "price": 28 }
]
```
Você pode mudar os preços, os nomes (`key`) e o número de fatias. Pode até
adicionar ou remover um tamanho inteiro copiando/apagando uma das linhas
`{ "key": ..., "slices": ..., "price": ... }` — só preste atenção pra manter a
vírgula entre cada item da lista e não deixar vírgula sobrando depois do último.

**`flavors`** — os sabores da pizza
```json
{ "name": "Pepperoni", "ingredients": "Mozzarella, spicy pepperoni, tomato base", "tags": ["Gluten", "Dairy"], "image": "pepperoni.webp" }
```
- `name`: nome do sabor.
- `ingredients`: descrição que aparece embaixo do nome.
- `tags`: rotulozinhos tipo "Vegetarian", "Gluten", "Dairy" — pode adicionar,
  remover ou trocar, sempre entre aspas e separados por vírgula dentro dos
  colchetes `[ ]`.
- `image`: o nome do arquivo de foto desse sabor (veja a seção 2 abaixo).

⚠️ **Importante sobre a ordem dos sabores**: a imagem da pizza giratória
(`FULL_PIZZA.webp`) já vem com as fatias desenhadas numa ordem fixa ao redor do
círculo. A lista de sabores no `pizzeria.json` **precisa seguir essa mesma
ordem** (sentido horário), senão o nome mostrado na tela não vai bater com a
fatia que está na frente. Se você só está trocando nomes/preços/ingredientes
dos 8 sabores que já existem, não precisa se preocupar com isso. Se quiser usar
uma imagem de roda diferente, veja a seção 2.

---

## 2. Onde colocar as fotos

As fotos ficam em:

```
assets/images/pizzas/
```

Tem dois tipos de imagem ali:

1. **`FULL_PIZZA.webp`** — a "roda" inteira, a pizza grande giratória que é o
   destaque visual do site. É uma arte única, com todas as fatias já montadas
   em círculo. **Isso não é algo que o site gera sozinho** a partir de fotos
   soltas — é uma imagem pronta que você (ou um designer) precisa fornecer,
   substituindo o arquivo atual mantendo exatamente esse nome. Se você não tem
   como produzir essa arte, pode pedir para um designer gráfico ou usar uma
   ferramenta como Canva para montar as fatias em círculo e exportar como uma
   imagem só.

2. **As 8 fotos de sabor** (`pepperoni.webp`, `veggie-supreme.webp`,
   `mushroom-ham.webp`, `mediterranean.webp`, `hawaiian.webp`,
   `greek-supreme.webp`, `ham-onion.webp`, `italian-supreme.webp`) — fotos
   individuais de cada sabor, uma pizza inteira ou fatia por foto. Para trocar,
   basta **substituir o arquivo mantendo o mesmo nome**, ou usar um nome novo e
   atualizar o campo `"image"` daquele sabor no `pizzeria.json` para bater com
   o nome do arquivo novo. Essas fotos são usadas, por exemplo, na prévia que
   aparece quando alguém compartilha o link do site no WhatsApp/Facebook (a
   primeira da lista, por padrão).

**Dica**: mantenha o formato `.webp` e evite arquivos muito grandes (acima de
uns 300KB) — imagens pesadas deixam o site lento para carregar no celular.

---

## 3. Gere o site

Depois de editar o `config/pizzeria.json`, abra o terminal na pasta do projeto e
rode:

```
npm run build
```

Isso lê o seu arquivo de configuração e atualiza automaticamente:
- o título da aba, a descrição no Google, e as prévias de redes sociais;
- as cores de toda a interface;
- o cardápio, os preços, a taxa de entrega e os links sociais.

Se você errou alguma coisa no `pizzeria.json` (por exemplo, esqueceu uma
vírgula), o comando vai parar e mostrar uma mensagem de erro explicando o que
está faltando — nesse caso, volte no arquivo, corrija e rode `npm run build` de
novo.

## 4. Confira

Para ver o site no seu navegador antes de publicar:

```
npm start
```

Isso abre um servidor local. Acesse `http://127.0.0.1:3000` no navegador e
confira se está tudo certo — nome, cores, cardápio, preços.

Se quiser uma checagem automática de que nada quebrou, rode também:

```
npm run check
```

## 5. Publique

Depois de conferir, publique os arquivos do projeto (a pasta inteira) no seu
serviço de hospedagem de preferência — é um site 100% estático (HTML/CSS/JS),
então funciona em qualquer hospedagem simples de arquivos.

---

## Resumo rápido

1. Edite `config/pizzeria.json` (nome, cor, contato, redes sociais, entrega, cardápio).
2. Troque as fotos em `assets/images/pizzas/` se precisar.
3. Rode `npm run build`.
4. Rode `npm start` e confira em `http://127.0.0.1:3000`.
5. Publique.

## O que NÃO editar

Alguns arquivos são **gerados automaticamente** pelo `npm run build` e trazem
um aviso no topo dizendo isso. Se você editar esses arquivos direto, suas
mudanças somem no próximo build:

- `index.html`
- `css/tokens.css`
- `js/site-config.js`

Se quiser mudar o **layout** (não só texto/cores/cardápio), quem edita é
`index.template.html` — mas isso já é território de quem programa, não faz
parte deste guia.
