local resourceName = GetCurrentResourceName()
local calls = {}
local callCount = 0

local function GetPlayersWithJob(jobs)
    -- Normalize jobs to array
    if type(jobs) == 'string' then jobs = {jobs} end
    local players = {}

    -- Attempt basic framework detection
    -- QBCore
    if GetResourceState('qb-core') == 'started' then
        local QBCore = exports['qb-core']:GetCoreObject()
        for _, src in ipairs(GetPlayers()) do
            local Player = QBCore.Functions.GetPlayer(tonumber(src))
            if Player then
                for _, job in ipairs(jobs) do
                    if Player.PlayerData.job.name == job then
                         -- Handle OnDuty check? g5-request uses it.
                         if Config.OnDutyOnly then
                             if Player.PlayerData.job.onduty then
                                 table.insert(players, tonumber(src))
                             end
                         else
                             table.insert(players, tonumber(src))
                         end
                         break
                    end
                end
            end
        end
    -- ESX
    elseif GetResourceState('es_extended') == 'started' then
        local ESX = exports['es_extended']:getSharedObject()
        for _, src in ipairs(GetPlayers()) do
            local xPlayer = ESX.GetPlayerFromId(tonumber(src))
            if xPlayer then
                for _, job in ipairs(jobs) do
                     if xPlayer.job.name == job then
                         table.insert(players, tonumber(src))
                         break
                     end
                end
            end
        end
    else
        -- Fallback: Send to everyone (dev mode or standalone)
        -- Or return empty if strict
        return GetPlayers()
    end

    return players
end

exports('GetDispatchCalls', function()
    return calls
end)

-- Unified Event Handler
local function HandleDispatch(data)
    callCount = callCount + 1
    data.id = tostring(callCount) -- Keep ID as string for UI consistency
    data.time = os.time() * 1000
    data.units = {}
    data.responses = {}

    if #calls >= Config.MaxCallList then
        table.remove(calls, 1)
    end

    calls[#calls + 1] = data

    -- Determine Recipients
    local recipients = {-1} -- Default to everyone if no filter

    if data.recipient and Config.JobMapping[data.recipient] then
        -- It's a mapped group like 'leo'
        local allowedJobs = Config.JobMapping[data.recipient]
        recipients = GetPlayersWithJob(allowedJobs)
    elseif data.jobs then
        -- Direct job list
        recipients = GetPlayersWithJob(data.jobs)
    end

    -- Broadcast to filtered players
    for _, target in ipairs(recipients) do
        TriggerClientEvent(resourceName..':client:add', target, data)
    end
end

RegisterNetEvent(resourceName..':server:createDispatch', HandleDispatch)
RegisterNetEvent(resourceName..':server:notify', HandleDispatch) -- Alias for compatibility

-- Callbacks
lib.callback.register(resourceName..':callback:getLatestDispatch', function(source)
    return calls[#calls]
end)

lib.callback.register(resourceName..':callback:getCalls', function(source)
    return calls
end)

-- Commands
lib.addCommand('dispatch', {
    help = 'Open Dispatch Menu'
}, function(source, raw)
    TriggerClientEvent(resourceName..':client:openMenu', source)
end)

lib.addCommand('911', {
    help = 'Send a message to 911',
    params = { { name = 'message', type = 'string', help = '911 Message' }},
}, function(source, args, raw)
    local fullMessage = raw:sub(5)
    TriggerClientEvent(resourceName..':client:sendEmergencyMsg', source, fullMessage, "911", false)
end)

lib.addCommand('911a', {
    help = 'Send an anonymous message to 911',
    params = { { name = 'message', type = 'string', help = '911 Message' }},
}, function(source, args, raw)
    local fullMessage = raw:sub(5)
    TriggerClientEvent(resourceName..':client:sendEmergencyMsg', source, fullMessage, "911", true)
end)

lib.addCommand('311', {
    help = 'Send a message to 311',
    params = { { name = 'message', type = 'string', help = '311 Message' }},
}, function(source, args, raw)
    local fullMessage = raw:sub(5)
    TriggerClientEvent(resourceName..':client:sendEmergencyMsg', source, fullMessage, "311", false)
end)

lib.addCommand('311a', {
    help = 'Send an anonymous message to 311',
    params = { { name = 'message', type = 'string', help = '311 Message' }},
}, function(source, args, raw)
    local fullMessage = raw:sub(5)
    TriggerClientEvent(resourceName..':client:sendEmergencyMsg', source, fullMessage, "311", true)
end)

RegisterNetEvent(resourceName..':server:attachUnit', function(dispatchId, unitData)
    local src = source
    -- Find dispatch by ID
    local dispatch = nil
    for _, c in ipairs(calls) do
        if c.id == dispatchId then dispatch = c break end
    end

    if dispatch then
        -- Add unit if not already attached
        local found = false
        for _, u in ipairs(dispatch.units) do
            if u.source == src then found = true break end
        end

        if not found then
            table.insert(dispatch.units, {
                source = src,
                callsign = unitData.callsign or "UNIT"
            })
            TriggerClientEvent(resourceName..':client:update', -1, dispatch)
        end
    end
end)
