/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { CspPolicies } from "@main/csp";

export function getCurrentCSPPolicies(): typeof CspPolicies {
    return { ...CspPolicies };
}

export function updateCSPPolicies(_event, policies: typeof CspPolicies) {
    Object.entries(policies).forEach(([domain, policy]) => {
        CspPolicies[domain] = policy;
    });

    Object.entries(CspPolicies).forEach(([domain, _policy]) => {
        if (!(domain in policies)) {
            delete CspPolicies[domain];
        }
    });
}
