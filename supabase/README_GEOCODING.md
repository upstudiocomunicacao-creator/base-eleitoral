# Base Eleitoral 360 - Geocodificação

Esta etapa prepara o sistema para transformar endereços em latitude/longitude sem substituir os mapas mockados.

## Como ativar a estrutura no Supabase

Rode no SQL Editor:

```sql
-- arquivo: supabase/geocoding-schema-update.sql
```

Esse script adiciona, quando ainda não existirem:

- `latitude`
- `longitude`
- `geographic_precision`
- `geocoding_status`
- `geocoding_source`
- `geocoding_confidence`
- `geocoding_last_attempt_at`
- `geocoding_error`

Tabelas suportadas:

- `leaders`
- `supporters`
- `electoral_zones`
- `field_agenda`
- `demands`

## Modo mockado

O provider padrão é:

```env
VITE_GEOCODING_PROVIDER=mock
```

O mock usa coordenadas aproximadas por bairro de Maricá e por município do RJ. Ele salva:

- `geocoding_status = approximate`
- `geocoding_source = mock`
- `geocoding_confidence` conforme precisão do endereço

## Precisão geográfica

O sistema classifica:

- Alta: rua, número, bairro, cidade e estado
- Média alta: CEP, rua, bairro e cidade
- Média: rua, bairro e cidade
- Baixa: bairro, cidade e estado
- Muito baixa: cidade e estado

## Revisão manual

Na tela **Geocodificação**, use **Editar coordenadas manualmente** para informar latitude/longitude revisadas. O sistema salva:

- `geocoding_status = manual`
- `geocoding_source = manual`

## Mapbox futuro

Para ativar futuramente:

```env
VITE_GEOCODING_PROVIDER=mapbox
VITE_MAPBOX_ACCESS_TOKEN=...
```

Nesta etapa, Mapbox ainda não executa chamadas reais. A estrutura foi deixada preparada para ligar o provider com controle de lote e custo.

## Google Maps futuro

Para ativar futuramente:

```env
VITE_GEOCODING_PROVIDER=google
VITE_GOOGLE_MAPS_API_KEY=...
```

Nesta etapa, Google também permanece desativado.

## Cuidados

- Não exponha `service_role` no front-end.
- Use apenas anon key com RLS.
- APIs reais de geocodificação têm custo por requisição.
- Lotes reais devem ter limite, fila e retentativa controlada.
- Coordenadas aproximadas não substituem revisão manual em dados críticos.
