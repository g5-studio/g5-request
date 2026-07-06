-- client/blips.lua
local blips = {}

RegisterNetEvent(GetCurrentResourceName() .. ':client:add', function(requestData)
    if not requestData or not requestData.blip then return end

    local x, y = requestData.x, requestData.y
    -- If no coords in root, try extras (legacy support)
    if not x or not y then
        if requestData.extras and requestData.extras.x and requestData.extras.y then
           x = requestData.extras.x
           y = requestData.extras.y
        end
    end

    if not x or not y then return end

    local id = requestData.id

    -- Remove existing if update
    if blips[id] then
        RemoveBlip(blips[id])
    end

    local blip = AddBlipForCoord(x, y, 0.0)
    SetBlipSprite(blip, requestData.blip.sprite or 161)
    SetBlipColour(blip, requestData.blip.color or 1)
    SetBlipScale(blip, requestData.blip.scale or 1.0)
    SetBlipAsShortRange(blip, true)

    BeginTextCommandSetBlipName("STRING")
    AddTextComponentString(requestData.blip.label or "Dispatch")
    EndTextCommandSetBlipName(blip)

    -- Radius Blip (optional, if 'radius' provided)
    -- For now just the main blip

    -- Flashing
    if requestData.blip.flash then
        SetBlipFlashes(blip, true)
    end

    blips[id] = blip

    -- Auto removal
    local time = requestData.blip.time or 15000
    SetTimeout(time, function()
        if blips[id] then
            RemoveBlip(blips[id])
            blips[id] = nil
        end
    end)
end)

RegisterNetEvent(GetCurrentResourceName() .. ':client:remove', function(id)
    if blips[id] then
        RemoveBlip(blips[id])
        blips[id] = nil
    end
end)
