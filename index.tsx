/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./style.css";

import { definePluginSettings } from "@api/Settings";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType, PluginNative } from "@utils/types";
import { findComponentByCodeLazy } from "@webpack";
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
    const AddButton = findComponentByCodeLazy('.Text,{color:"interactive-active",variant:"text-md/semibold",');
    
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
                <Button
                    size={Button.Sizes.ICON}
                    style={{ width: 44, height: 44, lineHeight: 0 }}
                    color={Button.Colors.PRIMARY}
                >
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        role="img"
                    >
                        <path fill="var(--text-feedback-critical)" d="M17.3 18.7a1 1 0 0 0 1.4-1.4L13.42 12l5.3-5.3a1 1 0 0 0-1.42-1.4L12 10.58l-5.3-5.3a1 1 0 0 0-1.4 1.42L10.58 12l-5.3 5.3a1 1 0 1 0 1.42 1.4L12 13.42l5.3 5.3Z" />
                    </svg>
                </Button>
            </div>;
        })())}

        <AddButton
            text={"Add Rule"}
            tooltip={"Add a CSP rule."}
            onClick={() => { }}
        />
    </div>;
}

export default definePlugin({
    name: "CSPManager",
    description: "Allows manual control of Vencords CSP.",
    authors: [Devs.surgedevs, { name: "paipai", id: 1375697625864601650n }],
    required: true,
    settings
});
