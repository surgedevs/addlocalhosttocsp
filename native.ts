/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { CspPolicies, MediaAndCssSrc } from "@main/csp";

CspPolicies.localhost = MediaAndCssSrc;
CspPolicies["127.0.0.1"] = MediaAndCssSrc;
