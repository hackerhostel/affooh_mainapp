import React, {useEffect, useRef} from "react";
import {models} from "powerbi-client";

export const PowerBIReport = ({ embedUrl, accessToken, reportId }) => {
    const reportRef = useRef(null);

    useEffect(() => {
        if (!embedUrl || !accessToken || !reportId) return;

        const embedConfig = {
            type: "report",
            id: reportId,
            embedUrl: embedUrl,
            accessToken: accessToken,
            tokenType: models.TokenType.Embed,
            settings: {
                panes: {
                    filters: {visible: true},
                    pageNavigation: { visible: true },
                },
            },
        };

        const reportContainer = reportRef.current;
        if (reportContainer) {
            if (typeof powerbi === "undefined") {
                console.log("PowerBI client is not available.");
                return;
            }

            const report = powerbi.embed(reportContainer, embedConfig);

            const handleLoaded = async () => {
                try {
                    const pages = await report.getPages();
                    const activePage = pages.find(p => p.isActive);
                    if (!activePage) {
                        console.error("No active page found.");
                        return;
                    }

                    const visuals = await activePage.getVisuals();
                    console.log("Visuals: ", visuals);

                    // Find the slicer visual by name
                    const orgSlicer = visuals.find(v => v.type === "slicer" && v.name === "63b7d56cab072ac63339");

                    if (!orgSlicer) {
                        console.error("Slicer visual '63b7d56cab072ac63339' not found.");
                        return;
                    }

                    // Debug current slicer state
                    const slicerState = await orgSlicer.getSlicerState();
                    console.log("Current Slicer State: ", slicerState);

                    // Apply slicer filter
                    await orgSlicer.setSlicerState({
                        filters: [
                            {
                                target: {
                                    table: "LocalDateTable_3c5128c6-2bab-47f1-8062-056d8c3f5fab",
                                    column: "Month",
                                },
                                operator: "In",
                                values: ["January"],
                            },
                        ],
                    });

                    console.log("Slicer filter applied!");
                } catch (error) {
                    console.log("Error applying slicer filter:", error);
                }
            };

            report.on("loaded", handleLoaded);

            // Cleanup on unmount
            return () => {
                if (report) {
                    report.off("loaded", handleLoaded);
                }
            };
        }
    }, [embedUrl, accessToken, reportId]);

    return <div ref={reportRef} style={{ height: "700px", width: "100%" }} />;
};
