print('^2[g5-request] Loading Config...^7')
Config = {}

-- Keybinds
Config.OpenSettingsKey = 'F3'
Config.OpenDispatchMenu = 'F2'
Config.AcceptKey = 'Y'
Config.DenyKey = 'N'

-- Existing Config
Config.Position = 'top-right'
Config.DefaultTimeout = 15000

Config.ShortCalls = false
Config.Debug = false
Config.RespondKeybind = 'Y'
Config.AlertTime = 5
Config.MaxCallList = 25
Config.OnDutyOnly = true

-- Job Configuration
Config.JobMapping = {
    ['leo'] = {'police', 'sheriff', 'trooper'},
    ['ems'] = {'ambulance', 'medic'},
    ['mechanic'] = {'mechanic'}
}

Config.DefaultAlertsDelay = 5
Config.DefaultAlerts = {
    Speeding = true,
    Shooting = true,
    Autotheft = true,
    Melee = true,
    PlayerDowned = true,
    Explosion = true
}

Config.MinOffset = 1
Config.MaxOffset = 120

-- Weapon Whitelist
Config.WeaponWhitelist = {
    'WEAPON_GRENADE', 'WEAPON_BZGAS', 'WEAPON_MOLOTOV', 'WEAPON_STICKYBOMB',
    'WEAPON_PROXMINE', 'WEAPON_SNOWBALL', 'WEAPON_PIPEBOMB', 'WEAPON_BALL',
    'WEAPON_SMOKEGRENADE', 'WEAPON_FLARE', 'WEAPON_PETROLCAN',
    'WEAPON_FIREEXTINGUISHER', 'WEAPON_HAZARDCAN', 'WEAPON_RAYCARBINE', 'WEAPON_STUNGUN'
}

-- Blip Configuration
Config.Blips = {
    ['shooting'] = {
        radius = 0, sprite = 110, color = 1, scale = 1.5, length = 2,
        sound = 'Lose_1st', sound2 = 'GTAO_FM_Events_Soundset', offset = false, flash = false
    },
    ['vehicletheft'] = {
        radius = 0, sprite = 595, color = 60, scale = 1.5, length = 2,
        sound = 'Lose_1st', sound2 = 'GTAO_FM_Events_Soundset', offset = false, flash = false
    },
    ['speeding'] = {
        radius = 0, sprite = 227, color = 1, scale = 1.5, length = 2,
        sound = 'Lose_1st', sound2 = 'GTAO_FM_Events_Soundset', offset = false, flash = false
    },
    ['melee'] = {
        radius = 0, sprite = 437, color = 1, scale = 1.5, length = 2,
        sound = 'Lose_1st', sound2 = 'GTAO_FM_Events_Soundset', offset = false, flash = false
    },
    ['explosion'] = {
        radius = 0, sprite = 368, color = 1, scale = 1.5, length = 2,
        sound = 'Lose_1st', sound2 = 'GTAO_FM_Events_Soundset', offset = false, flash = false
    },
    ['officerdown'] = {
        radius = 0, sprite = 480, color = 1, scale = 1.5, length = 2,
        sound = 'Lose_1st', sound2 = 'GTAO_FM_Events_Soundset', offset = false, flash = true
    },
}

-- Colors for vehicle data
Config.Colors = {
    ['0'] = 'Metallic Black', ['1'] = 'Metallic Graphite Black', -- ... abbreviated
}

return Config