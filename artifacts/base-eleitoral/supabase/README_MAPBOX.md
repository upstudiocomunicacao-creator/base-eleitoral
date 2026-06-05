# Mapbox no Base Eleitoral 360

Este projeto usa Mapbox apenas no front-end com token público de publicação. Não use `service_role` no navegador.

## 1. Criar conta e token

1. Acesse https://www.mapbox.com/.
2. Crie uma conta ou entre na sua conta.
3. Abra **Tokens** no painel do Mapbox.
4. Copie um token público, normalmente iniciado por `pk.`.
5. Em produção, restrinja o token aos domínios usados pelo app.

## 2. Configurar variável de ambiente

Como o projeto é Vite, configure no arquivo `.env.local` do app:

```env
VITE_MAPBOX_ACCESS_TOKEN=pk_seu_token_publico_aqui
VITE_GEOCODING_PROVIDER=mock
```

Depois reinicie o servidor local.

## 3. Como testar

1. Entre no sistema com um usuário permitido.
2. Abra `/mapa-rj`.
3. Abra `/mapa-marica`.
4. Teste os modos:
   - **Pins**: exibe pontos individuais.
   - **Heatmap**: exibe concentração ponderada.
   - **Cluster**: agrupa pontos próximos.
   - **Mock**: volta para o mapa estratégico simulado.

## 4. De onde vêm os dados

O mapa real lê os dados já conectados ao Supabase e usa somente registros com `latitude` e `longitude` preenchidos.

Tabelas preparadas:

- `leaders`
- `supporters`
- `electoral_zones`
- `demands`
- `field_agenda`

Registros sem coordenadas aparecem no card **Registros sem coordenadas**, com atalho para o módulo de Geocodificação.

## 5. Heatmap

As camadas de calor usam pesos calculados no front-end:

- Apoiadores confirmados têm peso maior.
- Lideranças com votos validados e confiança alta têm peso maior.
- Demandas críticas têm peso maior.
- Zonas com muitos eleitores e baixa cobertura elevam a oportunidade eleitoral.

Camadas disponíveis:

- Apoiadores
- Lideranças
- Votos validados
- Demandas
- Indecisos
- Oportunidade eleitoral

## 6. Pins e clusters

Os pins têm cores diferentes por tipo de registro:

- Lideranças
- Apoiadores
- Zonas eleitorais
- Demandas
- Agenda de campo

No modo Cluster, pontos próximos são agrupados. Ao clicar em um cluster, o mapa aproxima o zoom.

## 7. Fallback mockado

Se `VITE_MAPBOX_ACCESS_TOKEN` estiver vazio, o app mantém o mapa estratégico simulado e mostra o aviso:

> Mapbox ainda não configurado. Exibindo mapa estratégico simulado.

O botão **Mock** também permite voltar manualmente ao mapa simulado.

## 8. Cuidados de custo e limite

- O token público pode ficar no front-end, mas deve ser restrito por domínio no Mapbox.
- Evite carregar milhares de pontos sem filtros.
- Em produção, evoluir para filtros por cidade, bairro, período e tipo antes de carregar o mapa.
- Heatmap e cluster usam dados já carregados; geocodificação real deve ser controlada para evitar custo inesperado.

## 9. Próxima etapa sugerida

- Criar filtros reais dentro do mapa.
- Criar polígonos de bairros/municípios com PostGIS.
- Adicionar rotas para abrir a ficha completa de cada ponto.
- Paginar ou limitar pontos quando houver grande volume.
