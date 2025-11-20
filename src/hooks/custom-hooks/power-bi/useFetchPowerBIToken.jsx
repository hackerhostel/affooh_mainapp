import axios from 'axios';
import {useEffect, useState} from 'react';

const useFetchPowerBIToken = (datasetId, reportId) => {
    const [data, setData] = useState({});
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchPowerBIToken = async () => {
        setLoading(true)
        setError(false)
        try {
            const response = await axios.post(`https://api.powerbi.com/v1.0/myorg/GenerateToken`, {
                    datasets: [{id: datasetId}],
                    reports: [{id: reportId}]
                },
                {
                    headers: {
                        "Authorization": `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6ImltaTBZMnowZFlLeEJ0dEFxS19UdDVoWUJUayIsImtpZCI6ImltaTBZMnowZFlLeEJ0dEFxS19UdDVoWUJUayJ9.eyJhdWQiOiJodHRwczovL2FuYWx5c2lzLndpbmRvd3MubmV0L3Bvd2VyYmkvYXBpIiwiaXNzIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvOGFkMTk5NTEtNjFiYS00N2QxLWE3N2YtODlmYjdlYzRjODRmLyIsImlhdCI6MTczOTQ1MzE5NSwibmJmIjoxNzM5NDUzMTk1LCJleHAiOjE3Mzk0NTg3MTcsImFjY3QiOjAsImFjciI6IjEiLCJhaW8iOiJBVlFBcS84WkFBQUE5MVZmWEFFY0l6TmlDSlYyY1p0TGNaVkZqUlVQUFdRNkNLU2RtT2tQc1JiNjgxd2lkNW54STJpRkQrZXB6cUNqMVFNbDBsY3RXK012L000M1BQMUlJZHpkVVFSUDBJMVQ5bktBWlQraW9adz0iLCJhbXIiOlsicHdkIiwibWZhIl0sImFwcGlkIjoiMThmYmNhMTYtMjIyNC00NWY2LTg1YjAtZjdiZjJiMzliM2YzIiwiYXBwaWRhY3IiOiIwIiwiZmFtaWx5X25hbWUiOiJQYXRoaXJhbmEiLCJnaXZlbl9uYW1lIjoiTmlsYW5nYSIsImlkdHlwIjoidXNlciIsImlwYWRkciI6IjEwMy4yMS4xNjQuMzMiLCJuYW1lIjoiTmlsYW5nYSBQYXRoaXJhbmEiLCJvaWQiOiI2NGVhNzhjOS00MmFhLTQ1NDQtOTRhZC04NjEzYTk0N2YyNDUiLCJwdWlkIjoiMTAwMzIwMDJGREVCRUY0QSIsInJoIjoiMS5BVUlBVVpuUmlycGgwVWVuZjRuN2ZzVElUd2tBQUFBQUFBQUF3QUFBQUFBQUFBQ2tBR3hDQUEuIiwic2NwIjoiQXBwLlJlYWQuQWxsIENhcGFjaXR5LlJlYWQuQWxsIENhcGFjaXR5LlJlYWRXcml0ZS5BbGwgQ29ubmVjdGlvbi5SZWFkLkFsbCBDb25uZWN0aW9uLlJlYWRXcml0ZS5BbGwgQ29udGVudC5DcmVhdGUgRGFzaGJvYXJkLlJlYWQuQWxsIERhc2hib2FyZC5SZWFkV3JpdGUuQWxsIERhdGFmbG93LlJlYWQuQWxsIERhdGFmbG93LlJlYWRXcml0ZS5BbGwgRGF0YXNldC5SZWFkLkFsbCBEYXRhc2V0LlJlYWRXcml0ZS5BbGwgR2F0ZXdheS5SZWFkLkFsbCBHYXRld2F5LlJlYWRXcml0ZS5BbGwgSXRlbS5FeGVjdXRlLkFsbCBJdGVtLkV4dGVybmFsRGF0YVNoYXJlLkFsbCBJdGVtLlJlYWRXcml0ZS5BbGwgSXRlbS5SZXNoYXJlLkFsbCBPbmVMYWtlLlJlYWQuQWxsIE9uZUxha2UuUmVhZFdyaXRlLkFsbCBQaXBlbGluZS5EZXBsb3kgUGlwZWxpbmUuUmVhZC5BbGwgUGlwZWxpbmUuUmVhZFdyaXRlLkFsbCBSZXBvcnQuUmVhZFdyaXRlLkFsbCBSZXBydC5SZWFkLkFsbCBTdG9yYWdlQWNjb3VudC5SZWFkLkFsbCBTdG9yYWdlQWNjb3VudC5SZWFkV3JpdGUuQWxsIFRlbmFudC5SZWFkLkFsbCBUZW5hbnQuUmVhZFdyaXRlLkFsbCBVc2VyU3RhdGUuUmVhZFdyaXRlLkFsbCBXb3Jrc3BhY2UuR2l0Q29tbWl0LkFsbCBXb3Jrc3BhY2UuR2l0VXBkYXRlLkFsbCBXb3Jrc3BhY2UuUmVhZC5BbGwgV29ya3NwYWNlLlJlYWRXcml0ZS5BbGwiLCJzaWQiOiIwMDFmMDE5OS1lYzcxLTUzYTYtNDZmZC1hMjc0ZmUxZTIyNDEiLCJzaWduaW5fc3RhdGUiOlsia21zaSJdLCJzdWIiOiIxQmtZNnRFUkhiYk5TdXJmSlRTOGdRY0tpWDBrOG1LUFhkYWZPZ2g2R3hvIiwidGlkIjoiOGFkMTk5NTEtNjFiYS00N2QxLWE3N2YtODlmYjdlYzRjODRmIiwidW5pcXVlX25hbWUiOiJoZWxsb0BoYWNrZXJob3N0ZWwubGsiLCJ1cG4iOiJoZWxsb0BoYWNrZXJob3N0ZWwubGsiLCJ1dGkiOiIwQmZ3UjBNM2NFT3Q4OUV1UjBnR0FBIiwidmVyIjoiMS4wIiwid2lkcyI6WyI2MmU5MDM5NC02OWY1LTQyMzctOTE5MC0wMTIxNzcxNDVlMTAiLCJiNzlmYmY0ZC0zZWY5LTQ2ODktODE0My03NmIxOTRlODU1MDkiXSwieG1zX2lkcmVsIjoiMTYgMSIsInhtc19wbCI6ImVuLUdCIn0.f8Dn1qP8doL_3nt-aq0Vj2V2cHhzpuPR3TIZzRcZ422iG2x5wt9JAMsTT8eNHSQaDKlP6o9tdTEmcXUP34ahfiQK9d7-52E8MXQsKLzXcnfgWDiPJD-Uv_CxZXgpN_DSQ1kpI6hBAbqjQ53Zd4HKHiGQDbuNfKvvYA7kpm6vadhOcsHkqmVzWpXv20Px_cdGjLKDfGsVeBMYbOOgEZnkaQl9QIiM3_OtpIbMC1Bv87gjOIvaONlHQvC8IobVzonJWhOZGWR2bFWudt9OU83i-wc2_Uap90zuOvQRvGerUcC4m4xKME2Cli3FJblbDzTDlxDNoekQLBZX51_MsH9rug`,
                        "Content-Type": "application/json"
                    }
                })
            const tokenResponse = response?.data;

            console.log(tokenResponse)

            // if (testPlanResponse?.id) {
            //     setLoading(false)
            //     setData(testPlanResponse)
            // }
        } catch (error) {
            setError(true)
            setLoading(false)
        }
    };

    useEffect(() => {
        if (datasetId !== '') {
            fetchPowerBIToken()
        }
    }, [datasetId, reportId]);

    return {data, error, loading};
};

export default useFetchPowerBIToken;
