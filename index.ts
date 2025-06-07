/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

export default definePlugin({
    name: "AddLocalhostToCSP",
    description: "Allows `localhost` and `127.0.0.1` to pass CSP (meaning you can load CSS, Themes and Images from there). Enabling the plugin does nothing!",
    authors: [Devs.surgedevs],
});
