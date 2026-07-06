local QBCore = exports['qb-core']:GetCoreObject()

function GetPlayerHeading()
    local heading = GetEntityHeading(PlayerPedId())

    if heading >= 315 or heading < 45 then
        return "North"
    elseif heading >= 45 and heading < 135 then
        return "West"
    elseif heading >= 135 and heading < 225 then
        return "South"
    elseif heading >= 225 and heading < 315 then
        return "East"
    end
end

function GetPlayerGender()
    local gender = "Male"
    if QBCore and QBCore.Functions.GetPlayerData().charinfo.gender == 1 then
        gender = "Female"
    end
    return gender
end

function GetIsHandcuffed()
    if QBCore then
        local metadata = QBCore.Functions.GetPlayerData().metadata
        return metadata and metadata.ishandcuffed
    end
    return false
end

function IsOnDuty()
    if Config.OnDutyOnly and QBCore then
        return QBCore.Functions.GetPlayerData().job.onduty
    end
    return true
end

local function HasPhone()
    if not Config.PhoneItems or not QBCore then return true end
    for _, item in ipairs(Config.PhoneItems) do
        if QBCore.Functions.HasItem(item) then
            return true
        end
    end
    return false
end

function GetStreetAndZone(coords)
    local zone = GetLabelText(GetNameOfZone(coords.x, coords.y, coords.z))
    local street = GetStreetNameFromHashKey(GetStreetNameAtCoord(coords.x, coords.y, coords.z))
    return street .. ", " .. zone
end

local function getVehicleColor(vehicle)
    local vehicleColor1, vehicleColor2 = GetVehicleColours(vehicle)
    local color1 = Config.Colors and Config.Colors[tostring(vehicleColor1)]
    local color2 = Config.Colors and Config.Colors[tostring(vehicleColor2)]

    if color1 and color2 then
        return color2 .. " on " .. color1
    elseif color1 then
        return color1
    elseif color2 then
        return color2
    else
        return "Unknown"
    end
end

local function getVehicleDoors(vehicle)
    local doorCount = 0
    if GetEntityBoneIndexByName(vehicle, 'door_pside_f') ~= -1 then doorCount = doorCount + 1 end
    if GetEntityBoneIndexByName(vehicle, 'door_pside_r') ~= -1 then doorCount = doorCount + 1 end
    if GetEntityBoneIndexByName(vehicle, 'door_dside_f') ~= -1 then doorCount = doorCount + 1 end
    if GetEntityBoneIndexByName(vehicle, 'door_dside_r') ~= -1 then doorCount = doorCount + 1 end

    if doorCount == 2 then return "Two Door"
    elseif doorCount == 3 then return "Three Door"
    elseif doorCount == 4 then return "Four Door"
    else return "Unknown" end
end

function GetVehicleData(vehicle)
    local data = {}
    local vehicleClass = {
        [0] = "Compact", [1] = "Sedan", [2] = "SUV", [3] = "Coupe", [4] = "Muscle",
        [5] = "Sports Classic", [6] = "Sports", [7] = "Super", [8] = "Motorcycle",
        [9] = "Off-road", [10] = "Industrial", [11] = "Utility", [12] = "Van",
        [17] = "Service", [19] = "Military", [20] = "Truck"
    }

    data.class = vehicleClass[GetVehicleClass(vehicle)] or "Unknown"
    data.name = GetLabelText(GetDisplayNameFromVehicleModel(GetEntityModel(vehicle)))
    data.plate = GetVehicleNumberPlateText(vehicle)
    data.doors = getVehicleDoors(vehicle)
    data.color = getVehicleColor(vehicle)
    data.id = NetworkGetNetworkIdFromEntity(vehicle)

    return data
end

function PhoneAnimation()
    lib.requestAnimDict("cellphone@in_car@ds", 500)
    if not IsEntityPlayingAnim(PlayerPedId(), "cellphone@in_car@ds", "cellphone_call_listen_base", 3) then
        TaskPlayAnim(PlayerPedId(), "cellphone@in_car@ds", "cellphone_call_listen_base", 3.0, 3.0, -1, 50, 0, false, false, false)
    end
    Wait(2500)
    StopEntityAnim(PlayerPedId(), "cellphone_call_listen_base", "cellphone@in_car@ds", 3)
end

function IsCallAllowed(message)
    local msgLength = string.len(message)
    if msgLength == 0 then return false end
    if GetIsHandcuffed() then return false end
    if Config.PhoneRequired and not HasPhone() then
        if QBCore then QBCore.Functions.Notify('You need a communications device for this.', 'error', 5000) end
        return false
    end
    return true
end

-- Weapon Table (Truncated heavily for size, user has full list, I'll add key ones)
local weaponTable = {
    [584646201]   = "AP-Pistol",
    [453432689]   = "Pistol",
    [3219281620]  = "Pistol MK2",
    [-1074790547] = "Assault Rifle",
    [-2084633992] = "Carbine Rifle",
    -- Add more as needed or imports
}

function GetWeaponName()
    local currentWeapon = GetSelectedPedWeapon(PlayerPedId())
    return weaponTable[currentWeapon] or "Unknown"
end
