local resourceName = GetCurrentResourceName()

local function GetDispatchData()
    local playerPed = PlayerPedId()
    local coords = GetEntityCoords(playerPed)
    local streetName, crossing = GetStreetNameAtCoord(coords.x, coords.y, coords.z)
    local street = GetStreetNameFromHashKey(streetName)
    if crossing then
        street = street .. " / " .. GetStreetNameFromHashKey(crossing)
    end

    local data = {
        coords = coords,
        street = street,
        zone = GetLabelText(GetNameOfZone(coords.x, coords.y, coords.z))
    }

    if IsPedInAnyVehicle(playerPed, false) then
        local vehicle = GetVehiclePedIsIn(playerPed, false)
        local primary, secondary = GetVehicleColours(vehicle)

        data.vehicle = {
            model = GetDisplayNameFromVehicleModel(GetEntityModel(vehicle)),
            plate = GetVehicleNumberPlateText(vehicle),
            primaryColor = primary,
            secondaryColor = secondary,
            useVehicleInfo = true -- Flag for UI to know it should parse this
        }

        -- Try to get class name (can be enhanced with specific framework logic if needed)
        local classId = GetVehicleClass(vehicle)
        data.vehicle.class = GetLabelText("VEH_CLASS_" .. classId)
    end

    return data
end

exports('getDispatchData', GetDispatchData)

exports('createDispatch', function(data)
    print('createDispatch', json.encode(data))
    if not data then return end

    local dispatchInfo = GetDispatchData()

    -- Merge auto-gathered info with passed data
    -- Defaults from GetDispatchData can be overridden by passed data
    data.extras = data.extras or {}

    if not data.extras.Location then
        data.extras.Location = dispatchInfo.street
    end

    if dispatchInfo.vehicle and not data.vehicle then
        data.vehicle = {
            model = dispatchInfo.vehicle.model,
            plate = dispatchInfo.vehicle.plate,
            color = dispatchInfo.vehicle.primaryColor, -- Simplification for UI
            class = dispatchInfo.vehicle.class
        }
    end

    -- Add coordinates if not present
    if not data.x and not data.y then
        data.x = dispatchInfo.coords.x
        data.y = dispatchInfo.coords.y
    end

    -- Default Blip Settings
    if not data.blip then
        data.blip = {
            sprite = data.blipSprite or 161, -- Default: Radar circle
            color = data.blipColor or 1, -- Default: Red
            scale = data.blipScale or 1.0,
            time = data.blipTime or (data.timeout or 15000), -- Match timeout or default
            label = data.title or "Dispatch"
        }
    end

    print(('DEBUG: Triggering Server Event %s:server:createDispatch'):format(resourceName))
    TriggerServerEvent(('%s:server:createDispatch'):format(resourceName), data)
end)

RegisterNetEvent(resourceName..':client:sendEmergencyMsg', function(message, type, anonymous)
    local ped = PlayerPedId()
    local coords = GetEntityCoords(ped)
    local street = GetStreetAndZone(coords)
    local gender = GetPlayerGender()

    local title = type == "911" and "911 Call" or "311 Call"
    if anonymous then title = title .. " (Anonymous)" end

    exports[resourceName]:createDispatch({
        title = title,
        titleIcon = "phone",
        code = type,
        tag = type,
        recipient = 'leo',
        priority = 3,
        x = coords.x,
        y = coords.y,
        blipSprite = 66,
        blipColor = type == "911" and 1 or 5,
        blipScale = 1.0,
        extras = {
            { icon = "phone", name = "Service", value = type },
            { icon = "user", name = "Caller", value = anonymous and "Anonymous" or (LocalPlayer.state.callsign or "Unknown") },
            { icon = "venus-mars", name = "Gender", value = gender },
            { icon = "location-dot", name = "Location", value = street },
            { icon = "comment", name = "Message", value = message }
        }
    })

    lib.notify({title = title, description = 'Mensagem enviada com sucesso.', type = 'success'})
end)
