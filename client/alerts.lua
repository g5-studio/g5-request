local lastAlert = 0
local timer = {}
local QBCore = exports['qb-core']:GetCoreObject()
local resourceName = GetCurrentResourceName()

-- Helper to wait for config load if necessary
local function WaitForConfig()
    while not Config or not Config.DefaultAlerts do
        Wait(100)
    end
end

-- Helper to check cooldown to prevent spam (Per Alert Type)
local function WaitTimer(name, action, ...)
    if not Config.DefaultAlerts[name] then return end

    if not timer[name] then
        timer[name] = true
        action(...)
        SetTimeout(Config.DefaultAlertsDelay * 1000, function()
            timer[name] = false
        end)
    end
end

local function Panic()
    local ped = PlayerPedId()
    local coords = GetEntityCoords(ped)
    local street = GetStreetAndZone(coords)

    -- Play animation?
    PhoneAnimation()

    -- Trigger Dispatch
    exports[resourceName]:createDispatch({
        title = "Officer in Distress - 10-78",
        titleIcon = "skull",
        code = "10-78",
        tag = "PANIC",
        recipient = 'leo', -- Send to LEO/EMS? Usually both or just LEO.
        priority = 1, -- Max priority
        x = coords.x,
        y = coords.y,
        blipSprite = 161, -- Radar circle or panic sprite?
        blipColor = 75, -- Red?
        blipScale = 2.0,
        blipFlash = true,
        sound = "Panic_Button", -- Need ensure sound exists or fallback
        extras = {
            { icon = "skull", name = "Situation", value = "Officer needs immediate assistance!" },
            { icon = "location-dot", name = "Location", value = street },
            { icon = "user", name = "Officer", value = LocalPlayer.state.callsign or "Unknown" }
        }
    })

    lib.notify({title = 'Dispatch', description = 'Panic Button Activated!', type = 'error'})
end

RegisterCommand("panic", function()
    Panic()
end, false)
RegisterCommand("10-78", function()
    Panic()
end, false)

local function IsWeaponWhitelisted(weapon)
    if not Config.WeaponWhitelist then return false end
    for _, hash in ipairs(Config.WeaponWhitelist) do
        if weapon == GetHashKey(hash) then
            return true
        end
    end
    return false
end

-- Alert Implementations
local function Shooting()
    local ped = PlayerPedId()
    local weapon = GetSelectedPedWeapon(ped)
    local coords = GetEntityCoords(ped)

    if IsWeaponWhitelisted(weapon) then return end

    local blipConf = Config.Blips['shooting']
    exports[resourceName]:createDispatch({
        title = "Disparos de Arma de Fogo",
        titleIcon = "crosshairs",
        code = "10-71",
        tag = "TIROS",
        recipient = 'leo',
        priority = 2,
        x = coords.x,
        y = coords.y,
        blipSprite = blipConf.sprite,
        blipColor = blipConf.color,
        blipScale = blipConf.scale,
        sound = blipConf.sound,
        extras = {
            { icon = "crosshairs", name = "Situation", value = "Shots Fired" },
            { icon = "location-dot", name = "Location", value = GetStreetAndZone(coords) },
            { icon = "gun", name = "Weapon", value = GetWeaponName() }
        }
    })
end

local function VehicleTheft(vehicle)
    local ped = PlayerPedId()
    local coords = GetEntityCoords(ped)
    local blipConf = Config.Blips['vehicletheft']

    local vehicleData = GetVehicleData(vehicle)

    exports[resourceName]:createDispatch({
        title = "Roubo de Veículo",
        titleIcon = "car",
        code = "10-60",
        recipient = 'leo',
        tag = "ROUBO",
        priority = 2,
        x = coords.x,
        y = coords.y,
        blipSprite = blipConf.sprite,
        blipColor = blipConf.color,
        blipScale = blipConf.scale,
        sound = blipConf.sound,
        vehicle = vehicleData, -- Pass rich vehicle data
        extras = {
            { icon = "car", name = "Vehicle", value = vehicleData.name .. " ("..vehicleData.plate..")" },
            { icon = "location-dot", name = "Location", value = GetStreetAndZone(coords) },
            { icon = "palette", name = "Color", value = vehicleData.color }
        }
    })
end

-- Event Handlers (Better Performance than loops)
AddEventHandler('CEventGunShot', function(witnesses, ped)
    if IsPedCurrentWeaponSilenced(PlayerPedId()) then return end
    -- Check if player is the shooter
    if ped ~= PlayerPedId() then return end

    WaitTimer('Shooting', function()
        Shooting()
    end)
end)

-- Vehicle Theft Triggers
AddEventHandler('CEventShockingCarAlarm', function(witnesses, ped)
    if ped ~= PlayerPedId() then return end

    WaitTimer('Autotheft', function()
        local vehicle = GetVehiclePedIsUsing(ped, true)
        if vehicle then
            VehicleTheft(vehicle)
        end
    end)
end)

-- Speeding Trigger
CreateThread(function()
    while true do
        Wait(2000) -- Check every 2 seconds
        if Config.DefaultAlerts.Speeding then
            local ped = PlayerPedId()
            if IsPedInAnyVehicle(ped, false) then
                local vehicle = GetVehiclePedIsIn(ped, false)
                local speed = GetEntitySpeed(vehicle) * 3.6 -- km/h
                -- Configurable limit? For now hardcoded 140km/h ~ 85mph
                local limit = 140

                if speed > limit and GetPedInVehicleSeat(vehicle, -1) == ped then
                     local class = GetVehicleClass(vehicle)
                     if class ~= 15 and class ~= 16 and class ~= 21 then -- Ignore Heli, Plane, Train
                        WaitTimer('Speeding', function()
                            local vehicleData = GetVehicleData(vehicle)
                            local coords = GetEntityCoords(ped)
                            local blipConf = Config.Blips['speeding']

                            exports[resourceName]:createDispatch({
                                title = "Excesso de Velocidade",
                                titleIcon = "gauge-high",
                                code = "10-94",
                                tag = "TRÂNSITO",
                                recipient = 'leo',
                                priority = 2,
                                x = coords.x,
                                y = coords.y,
                                blipSprite = blipConf.sprite,
                                blipColor = blipConf.color,
                                blipScale = blipConf.scale,
                                sound = blipConf.sound,
                                vehicle = vehicleData,
                                extras = {
                                    { icon = "car", name = "Vehicle", value = vehicleData.name },
                                    { icon = "gauge-high", name = "Speed", value = math.floor(speed) .. " km/h" },
                                    { icon = "location-dot", name = "Location", value = GetStreetAndZone(coords) },
                                    { icon = "palette", name = "Color", value = vehicleData.color }
                                }
                            })
                        end)
                     end
                end
            end
        end
    end
end)

-- Melee / Fight Trigger
AddEventHandler('CEventShockingSeenMeleeAction', function(witnesses, ped)
    if not Config.DefaultAlerts.Melee then return end
    if ped ~= PlayerPedId() then return end

    WaitTimer('Melee', function()
        local coords = GetEntityCoords(ped)
        local blipConf = Config.Blips['melee']

            exports[resourceName]:createDispatch({
            title = "Briga / Agressão",
            titleIcon = "hand-fist",
            code = "10-10",
            tag = "BRIGA",
            recipient = 'leo',
            priority = 2,
            x = coords.x,
            y = coords.y,
            blipSprite = blipConf.sprite,
            blipColor = blipConf.color,
            blipScale = blipConf.scale,
            sound = blipConf.sound,
            extras = {
                { icon = "hand-fist", name = "Situation", value = "Physical Altercation" },
                { icon = "location-dot", name = "Location", value = GetStreetAndZone(coords) }
            }
        })
    end)
end)

-- Explosion Trigger
AddEventHandler('explosionEvent', function(sender, ev)
    if not Config.DefaultAlerts.Explosion then return end
    -- Sender check?
    -- If sender is self (need to check mechanism, usually triggered for everyone?)
    -- Actually 'explosionEvent' is triggered for all clients. We need to filter repeats.
    -- Better: check if explosion is near player and player caused it?
    -- Simple check: sender == GetPlayerServerId(PlayerId())

    if sender == GetPlayerServerId(PlayerId()) then
        -- Only alert for specific explosion types? ev.explosionType
        -- 0-Grenade, 1-GrenadeLaunch, 2-StickyBomb, 3-Molotov, 4-Rocket, 5-TankShell, 6-HiOctane
        -- Filter silent ones?
        if ev.explosionType == 9 then return end -- Gas Can?

        WaitTimer('Explosion', function()
            local coords = GetEntityCoords(PlayerPedId()) -- Or ev.posX, ev.posY?
            -- ev has coords? yes
            local blipConf = Config.Blips['explosion']

            exports[resourceName]:createDispatch({
                title = "Explosão",
                titleIcon = "fire",
                code = "10-80", -- Explosion code?
                tag = "EXPLOSÃO",
                recipient = 'leo', -- And EMS?
                priority = 1,
                x = coords.x,
                y = coords.y,
                blipSprite = blipConf.sprite,
                blipColor = blipConf.color,
                blipScale = blipConf.scale,
                blipFlash = true,
                sound = blipConf.sound,
                extras = {
                    { icon = "fire", name = "Situation", value = "Explosion Reported" },
                    { icon = "location-dot", name = "Location", value = GetStreetAndZone(coords) }
                }
            })
        end)
    end
end)

-- Fallback loop for carjacking if event isn't reliable
CreateThread(function()
    while true do
        Wait(1000)
        local ped = PlayerPedId()
        if IsPedJacking(ped) then
            WaitTimer('Autotheft', function()
                local vehicle = GetVehiclePedIsUsing(ped, true)
                if vehicle then
                    VehicleTheft(vehicle)
                end
            end)
        end
    end
end)

-- Player Downed (Officer Down)
AddEventHandler('gameEventTriggered', function(event, data)
    if event ~= "CEventNetworkEntityDamage" then return end
    local victim, attacker, victimDied, weapon = data[1], data[2], data[4], data[7]

    if not Config.DefaultAlerts.PlayerDowned then return end

    if victim == PlayerPedId() and IsEntityDead(PlayerPedId()) then
        -- Check if officer
        local PlayerData = QBCore.Functions.GetPlayerData()
        local job = PlayerData.job.name

        local isLeo = false
        if Config.JobMapping['leo'] then
            for _, j in ipairs(Config.JobMapping['leo']) do
                if job == j then isLeo = true break end
            end
        end

        if isLeo and PlayerData.job.onduty then
             WaitTimer('PlayerDowned', function()
                 local coords = GetEntityCoords(PlayerPedId())
                 local blipConf = Config.Blips['officerdown']

                 exports[resourceName]:createDispatch({
                    title = "Oficial Abatido",
                    titleIcon = "skull",
                    code = "10-13",
                    tag = "URGENTE",
                    recipient = 'leo', -- Send to LEO/EMS
                    priority = 1,
                    x = coords.x,
                    y = coords.y,
                    blipSprite = blipConf.sprite,
                    blipColor = blipConf.color,
                    blipScale = blipConf.scale,
                    blipFlash = true,
                    sound = blipConf.sound,
                    extras = {
                        { icon = "skull", name = "Situation", value = "Officer Down" },
                        { icon = "location-dot", name = "Location", value = GetStreetAndZone(coords) },
                        { icon = "user", name = "Officer", value = LocalPlayer.state.callsign or "Unknown" }
                    }
                })
             end)
        end
    end
end)
