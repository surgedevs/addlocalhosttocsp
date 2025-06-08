/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./style.css";

import { definePluginSettings } from "@api/Settings";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType, PluginNative } from "@utils/types";
import { Button, Select, TextInput, useEffect, useState } from "@webpack/common";

const Native = VencordNative.pluginHelpers.CSPManager as PluginNative<typeof import("./native")>;

type PolicyMap = Record<string, string[]>;

const ConnectSrc = ["connect-src"];
const MediaSrc = [...ConnectSrc, "img-src", "media-src"];
const CssSrc = ["style-src", "font-src"];
const MediaAndCssSrc = [...MediaSrc, ...CssSrc];
const MediaScriptsAndCssSrc = [...MediaAndCssSrc, "script-src", "worker-src"];

const settings = definePluginSettings({
    cspRuleComponent: {
        type: OptionType.COMPONENT,
        component: SettingsBlock
    },
    cspRules: {
        type: OptionType.CUSTOM,
        default: {} as PolicyMap
    }
});

function SettingsBlock() {
    const [cspRules, setCspRules] = useState(settings.store.cspRules);

    useEffect(() => {
        (async () => {
            if (Object.entries(settings.store.cspRules).length === 0) {
                const defaultPolicies = await Native.getCurrentCSPPolicies();

                console.log("defaultPolicies", defaultPolicies);

                setCspRules(defaultPolicies);
                settings.store.cspRules = defaultPolicies;
            } else {
                setCspRules(settings.store.cspRules);
            }
        })();
    }, []);

    return <div className="cspmanager-container">
        {Object.entries(cspRules).map(([key, value]) => (() => {
            const [domain, setDomain] = useState(key);
            const [policy, setPolicy] = useState(value.join(" "));

            const onChangeDomain = (newDomain: string) => {
                const newRuleSet = { ...cspRules };
                delete newRuleSet[domain];
                newRuleSet[newDomain] = policy.split(" ");

                setDomain(newDomain);
                Native.updateCSPPolicies(newRuleSet);
            };

            const onChangePolicy = newPolicy => {
                const newRuleSet = { ...cspRules };
                newRuleSet[domain] = newPolicy.value;

                setPolicy(newPolicy.value.join(" "));
                Native.updateCSPPolicies(newRuleSet);
            };

            return <div key={domain} className={"cspmanager-block"}>
                <TextInput value={domain} onChange={onChangeDomain} className="cspmanager-input" />

                <Select
                    options={[
                        { value: ConnectSrc, label: "Connect" },
                        { value: MediaSrc, label: "Media" },
                        { value: CssSrc, label: "Css" },
                        { value: MediaAndCssSrc, label: "Media&Css" },
                        { value: MediaScriptsAndCssSrc, label: "Media&Scripts&Css" },
                    ]}
                    serialize={String}
                    isSelected={v => v.join(" ") === policy}
                    select={onChangePolicy}
                    className={"cspmanager-select"}
                />

                <Button color={Button.Colors.RED}>
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        role="img"
                    >
                        <path fill="currentColor" d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z" />
                    </svg>
                </Button>
            </div>;
        })())}

        <Button color={Button.Colors.GREEN} className="cspmanager-add">
            <svg aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path fill="currentColor" d="M13 6a1 1 0 1 0-2 0v5H6a1 1 0 1 0 0 2h5v5a1 1 0 1 0 2 0v-5h5a1 1 0 1 0 0-2h-5V6Z" className="" />
            </svg>
        </Button>
    </div>;
}

export default definePlugin({
    name: "CSPManager",
    description: "Allows manual control of Vencords CSP.",
    authors: [Devs.surgedevs],
    required: true,
    settings
});
