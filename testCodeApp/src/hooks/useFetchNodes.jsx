import { useState, useEffect } from "react";

export function useFetchNodes(url) {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.text();
      })
      .then((allText) => {
        const lines = allText.split("\n");
        const nodesData = [];

        lines.forEach((line) => {
          const elements = line.trim().split(" ");

          if (elements.length >= 4) {
            nodesData.push({
              node_name: elements[0],
              x: Number(elements[elements.length - 3]),
              y: Number(elements[elements.length - 2]),
              next_node: elements[elements.length - 1],
            });
          }
        });

        setNodes(nodesData);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, [url]);

  return { nodes, loading, error };
}
