import { useState, useEffect } from "react";

// 커스텀 Hook 정의
export function useFetchEdges(url) {
  const [edges, setEdges] = useState([]);
  const [radius, setRadius] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 데이터를 fetch로 불러옴

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.text();
      })
      .then((allEdgesText) => {
        const lines = allEdgesText.split("\n");
        const edgesData = [];
        let radiusData = null;

        lines.forEach((line) => {
          const elements = line.trim().split(" "); // 공백으로 나누기
          if (elements[0] === "radius" && elements.length === 2) {
            radiusData = 5; // 예시로 설정한 radius 값
          }
          if (elements.length >= 4 && elements[0][0] !== "#") {
            edgesData.push({
              edge_name: elements[0] + "_" + elements[1],
              from: elements[0],
              to: elements[1],
              rail_type: elements[3],
              direction: elements[4],
              rotationDegree: elements[6],
            });
          }
        });
        setEdges(edgesData);
        setRadius(radiusData);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, [url]);

  return { edges, radius, loading, error };
}
