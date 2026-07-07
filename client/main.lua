-- mri_Qrequest (formerly g5-request)
-- Core initialization and critical commands

local resourceName = GetCurrentResourceName()

-- Helper to wait for config load if necessary
local function WaitForConfig()
    while not Config or not Config.OpenSettingsKey do
        Wait(100)
    end
end

RegisterNUICallback('nuiReady', function(_, cb)
    print(string.format('[%s] NUI ready', resourceName))
    TriggerEvent(resourceName..':client:nuiReady')
    SendNUIMessage({
        action = 'setVisible',
        data = true
    })
    cb({ok = true})
end)

CreateThread(function()
    WaitForConfig()

    RegisterCommand('ui_settings', function()
        -- Toggle Settings
        SetNuiFocus(true, true)
        SendNUIMessage({ action = 'setVisible', data = true })
        SendNUIMessage({ action = 'openSettings' })
    end)
    RegisterKeyMapping('ui_settings', 'Open Settings', 'keyboard', Config.OpenSettingsKey or 'F3')

    RegisterCommand('ui_dispatch', function()
        -- Toggle Dispatch Menu
        SetNuiFocus(true, true)
        SendNUIMessage({ action = 'setVisible', data = true })
        SendNUIMessage({ action = 'openDispatch' })
    end)
    RegisterKeyMapping('ui_dispatch', 'Open Dispatch Menu', 'keyboard', Config.OpenDispatchMenu or 'F2')
end)

RegisterNetEvent(resourceName..':client:openMenu', function()
    SetNuiFocus(true, true)
    SendNUIMessage({ action = 'setVisible', data = true })
    SendNUIMessage({ action = 'openDispatch' })
end)

RegisterNUICallback('close', function(_, cb)
    SetNuiFocus(false, false)
    cb({ok = true})
end)

RegisterCommand("callsign", function(source, args, rawCommand)
    local callsign = args[1]
    if callsign then
        LocalPlayer.state.callsign = callsign
        lib.notify({title = 'Callsign', description = locale('callsign_updated', callsign), type = 'success'})
        SendNUIMessage({
            action = 'updateCallsign',
            callsign = callsign
        })
    else
        lib.notify({title = 'Callsign', description = locale('callsign_usage'), type = 'error'})
    end
end, false)
