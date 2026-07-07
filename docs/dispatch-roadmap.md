# g5-request — Dispatch Roadmap & Status

> **Objetivo geral:** transformar o `g5-request` em um **substituto drop-in completo do `ps-dispatch`**,
> mantendo a base de _requests_ player-to-player e a UI própria em React/shadcn.
> A pasta `ps-dispatch/` no repo é apenas **referência** (não é um resource ativo).

Última atualização: 2026-07-07 (Rodadas 2, 3, 4 e 5 concluídas)

---

## Legenda de status
- ✅ **Feito** — implementado nesta base
- 🟡 **Parcial** — existe, mas incompleto/stub
- ⬜ **Pendente** — ainda não iniciado

---

## Rodada 1 — Base genérica + API pública + attach/detach ✅

Foco: engine de alertas sem duplicação, biblioteca pública de exports (item 1) e
responder tracking (item 2), além do `provide`.

| Entrega | Status | Onde |
|---|---|---|
| `provide "ps-dispatch"` no manifest | ✅ | `fxmanifest.lua` |
| Registro data-driven de alertas (`Config.Alerts`, 34 templates) | ✅ | `shared/config.lua` |
| `Config.Blips` completo (todos os codeNames) | ✅ | `shared/config.lua` |
| `Config.Colors` completo (0–160) | ✅ | `shared/config.lua` |
| Motor genérico `TriggerAlert(name, opts)` + `exports:DispatchAlert` | ✅ | `client/dispatch.lua` |
| Propagação de `flash` para o blip + remoção de prints de debug | ✅ | `client/dispatch.lua` |
| Biblioteca de **31 exports** compatíveis com ps-dispatch | ✅ | `client/exports.lua` |
| `CustomAlert(data)` traduzindo o schema flat do ps-dispatch | ✅ | `client/exports.lua` |
| Eventos de compat `ps-dispatch:client:*` | ✅ | `client/exports.lua` |
| Alertas automáticos refatorados p/ usar `TriggerAlert` (fim da duplicação) | ✅ | `client/alerts.lua` |
| Resolução de destinatários por `groups` (união multi-grupo) | ✅ | `server/dispatch.lua` |
| **Detach** de unidade + refactor do attach | ✅ | `server/dispatch.lua`, `client/request.lua` |
| Tradutor `ps-dispatch:server:notify` + `:attach`/`:detach` | ✅ | `server/dispatch.lua` |
| Exports client `AttachUnit`/`DetachUnit` + NUI callbacks | ✅ | `client/request.lua` |
| Fix de paridade: `/311` roteia para EMS | ✅ | `client/dispatch.lua` |

**Ainda não validado in-game** (não há interpretador Lua/servidor FiveM neste ambiente).
Teste pendente: subir o resource, disparar `exports['ps-dispatch']:StoreRobbery(1)`, validar
blip/alerta/menu e o fluxo attach→detach.

---

## Próximas rodadas (pendências priorizadas)

### Rodada 2 — Acabamento de alertas (alto valor percebido) ✅
- ✅ **Som nos blips**: `client/blips.lua:playAlertSound` toca via `PlaySound` nativo
  (sons frontend com `sound2`, ex. `Lose_1st`) e via `InteractSound_SV:PlayOnSource`
  quando `interact-sound` está ativo; fallback nativo garante que nunca fica mudo.
  Respeita `alertsMuted` (hook global p/ Rodada 4).
- ✅ **Radius blip** (`AddBlipForRadius` quando `radius > 0`) + **offset aleatório**
  (`Config.MaxOffset`, quando `offset = true`). Campos threaded via
  `TriggerAlert → createDispatch → :client:add`.
- ✅ **Fade/alpha** do radius blip de 128→0 ao longo de `length` minutos
  (fallback para `time` ms quando `length` ausente).
- ✅ Arquivos de som portados para `sounds/` (dispatch/panicbutton/robberysound `.ogg`)
  e declarados no `fxmanifest.lua`. (Bônus: `files{}` corrigido p/ servir `web/build`.)

> **Nota:** sons `.ogg` customizados dependem do `interact-sound` para tocar o arquivo
> exato; sem ele, cai no cue nativo. Playback via NUI (self-contained) fica p/ Rodada 4.

### Rodada 3 — Contexto e supressão de alertas (robustez) ✅
- ✅ **NoDispatchZones** (box via `lib.zones.box`): gunshot suprimido dentro
  (`client/alerts.lua` checa `inNoDispatchZone`). Ex.: Ammunation 1 e 2.
- ✅ **HuntingZones** (sphere via `lib.zones.sphere`) + reroute de tiro para
  `hunting` quando `inHuntingZone` + `Config.EnableHuntingBlip` (blip sprite 442).
- ✅ **Witness check** (`IsPedAWitness`): shooting/melee só alertam se o ped estiver
  na lista de testemunhas do evento shocking.
- ✅ `Config.Locations` (HuntingZones/NoDispatchZones) portado da referência.
  Zonas criadas em `client/zones.lua` (novo), expondo os globais
  `inHuntingZone`/`inNoDispatchZone`.

> **Nota:** `explosionEvent` (usado aqui) não entrega lista de testemunhas como o
> `CEventExplosionHeard` da referência, então o witness check não se aplica a explosões.

### Rodada 4 — UI / NUI (paridade de menu) ✅
- ✅ **Detach** na UI: botão "En route" (sair de en-route) no `DispatchItem` quando
  o callsign do jogador está entre `req.units` → `fetchNui('detachUnit')`.
- ✅ Callbacks faltantes (client `request.lua` + toolbar no `DispatchMenu`):
  - `toggleAlerts` — alterna `AlertsDisabled` (bloqueia cards+blips+som), com notify.
  - `clearBlips` — dispara `:client:clearBlips` (novo handler em `blips.lua`).
  - `refreshAlerts` — re-puxa `getCalls` e reinjeta via `:client:add`.
- ✅ Keybind dinâmico: `UpdateKeybinds()` habilita accept/deny só com request ativo
  (`:disable(not active)`), chamado em add/remove/answer + init desabilitado.
- ✅ Coloração por prioridade no `RequestCard` (priority 1 = borda + progress vermelhos;
  demais = tema default). Campo `priority` adicionado ao tipo `RequestData`.

> **Build:** `web/build` regenerado via `npm run build` (tsc + vite OK).
> **Nota:** `refreshAlerts` usa `getCalls` (lista completa do servidor, sem filtro de job);
> se necessário, filtrar no server numa rodada futura.

### Rodada 5 — Localização (i18n) ✅
- ✅ Sistema de locales: `lib.locale()` inicializado em `shared/config.lua` (lê o convar
  `ox:locale`, default `en`; defina `setr ox:locale "pt-br"` no server). Global `locale()`
  disponível em client e server (config é `shared_script`).
- ✅ `locales/*.json` criados para **en, pt-br, es, fr, de, nl, cs** (78 chaves cada,
  paridade validada). pt-br/en revisados; es/fr/de/nl/cs são best-effort (revisar com nativos).
- ✅ `Config.Alerts` sem literais: título resolvido de `alert_<name>`, `tag` virou chave de
  categoria resolvida de `tag_<key>` (13 categorias).
- ✅ Labels de campo, gênero, 911/311, pânico, notifies e o path de compat ps-dispatch
  (`CustomAlert` client + `translatePsDispatch` server) todos via `locale()`.

> **Nota:** o "chrome" estático da NUI React (botões Accept/Refuse, "Dispatch Panel", etc.)
> ainda é hardcoded — os textos **dinâmicos** (títulos/tags/campos vindos do Lua) já são i18n.
> Comandos de teste em `server/main.lua` e descrições de keybind não foram localizados (dev-only).

### Rodada 6 — Integração / gating (fechamento drop-in)
- ⬜ **Phone gating** de fato: `Config.PhoneRequired`/`Config.PhoneItems` existem no ps mas
  não estão definidos aqui; `utils.lua` já referencia `HasPhone`/`IsCallAllowed`.
- ⬜ **Handcuff check** ao abrir chamada (`ishandcuffed`) — `GetIsHandcuffed` já existe em `utils.lua`.
- 🟡 **ESX**: `GetPlayersWithJob` tem branch ESX, mas `OnDutyOnly` só é respeitado no QBCore;
  além disso o client tem dependência dura de `qb-core` (quebra em servidores ESX-only).
- ⬜ Preencher/validar `weaponTable` (`GetWeaponName`) — hoje truncado (~5 armas).

---

## Referência rápida da API pública (Rodada 1)

Chamável via `exports['ps-dispatch']:<Nome>(...)` (graças ao `provide`).

**Alertas sem argumento:**
`VehicleTheft`, `Shooting`, `Hunting`, `VehicleShooting`, `SpeedingVehicle`, `Fight`,
`PrisonBreak`, `DrugDealing`, `DrugSale`, `SuspiciousActivity`, `HouseRobbery`, `YachtHeist`,
`SignRobbery`, `ArtGalleryRobbery`, `HumaneRobbery`, `TrainRobbery`, `VanRobbery`,
`UndergroundRobbery`, `DrugBoatRobbery`, `UnionRobbery`, `InjuriedPerson`, `DeceasedPerson`,
`OfficerDown`, `OfficerBackup`, `OfficerInDistress`, `EmsDown`, `Explosion`.

**Alertas com `camId` (heists):**
`StoreRobbery(camId)`, `FleecaBankRobbery(camId)`, `PaletoBankRobbery(camId)`,
`PacificBankRobbery(camId)`, `VangelicoRobbery(camId)`.

**Alertas com entidade de veículo:**
`CarJacking(vehicle)`, `CarBoosting(vehicle)`.

**Genéricos:**
- `CustomAlert(data)` — schema flat do ps-dispatch (com `alert = { sprite, color, ... }`).
- `DispatchAlert(name, opts)` — atalho nativo para o motor genérico (`name` = chave de `Config.Alerts`).

**Responder tracking:**
- `AttachUnit(dispatchId)` / `DetachUnit(dispatchId)` (client exports).
- Server events: `<resource>:server:attachUnit` / `:detachUnit` (+ compat `ps-dispatch:server:attach`/`:detach`).

**Como adicionar um alerta novo (sem duplicar código):**
1. Adicione uma entrada em `Config.Alerts['meucodigo'] = { title, code, icon, priority, groups, ... }`.
2. (Opcional) adicione o blip em `Config.Blips['meucodigo']`.
3. Dispare com `exports['ps-dispatch']:DispatchAlert('meucodigo')` — ou crie um export nomeado
   em `client/exports.lua` (uma linha).
