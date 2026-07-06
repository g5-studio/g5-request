# g5-request — Dispatch Roadmap & Status

> **Objetivo geral:** transformar o `g5-request` em um **substituto drop-in completo do `ps-dispatch`**,
> mantendo a base de _requests_ player-to-player e a UI própria em React/shadcn.
> A pasta `ps-dispatch/` no repo é apenas **referência** (não é um resource ativo).

Última atualização: 2026-07-06 (Rodada 2 concluída)

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

### Rodada 3 — Contexto e supressão de alertas (robustez)
- ⬜ **NoDispatchZones** (suprimir alertas em áreas, ex. Ammunation).
- ⬜ **HuntingZones** + reroute de tiro para "hunting" + `Config.EnableHuntingBlip`.
- ⬜ **Witness check** (`isPedAWitness`): só alertar se houver testemunha por perto.
- ⬜ Portar `Config.Locations` (Hunting/NoDispatch) da referência.

### Rodada 4 — UI / NUI (paridade de menu)
- ⬜ Wiring do **detach** na UI React (botão "sair de en-route").
- ⬜ Callbacks faltantes: `toggleAlerts` (parar de receber), `clearBlips`, `refreshAlerts`.
- ⬜ Habilitar/desabilitar keybind dinamicamente durante alerta ativo.
- ⬜ Coloração por prioridade no card (1 = vermelho / 2 = default) — validar no `RequestCard`.

### Rodada 5 — Localização (i18n)
- ⬜ Sistema de locales (`lib.locale` / `ox:locale`) — hoje strings hardcoded em PT/EN misturado.
- ⬜ Portar/adaptar `locales/*.json` (en, pt-br, es, fr, de, nl, cs).
- ⬜ Trocar títulos/tags de `Config.Alerts` por chaves de locale.

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
