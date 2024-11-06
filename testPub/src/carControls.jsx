import { useFetchEdges } from "./hooks/useFetchEdges";
import { useFetchNodes } from "./hooks/useFetchNodes";

export const CarControls = ({
  carID,
  handleCommand,
  disableBranch,
  receivedMessages,
}) => {
  const {
    edges,
    radius,
    loading: edgesLoading,
    error: edgesError,
  } = useFetchEdges("./simpleRailConfig/edges.cfg");
  const {
    nodes,
    loading: nodesLoading,
    error: nodesError,
  } = useFetchNodes("./simpleRailConfig/nodes.cfg");

  // 데이터 로딩 중이거나 에러 발생 시 반환
  if (edgesLoading || nodesLoading) return <div>Loading...</div>;
  if (edgesError || nodesError) return <div>Error loading data</div>;

  // 메시지가 없는 경우 처리
  if (!receivedMessages || receivedMessages.length === 0) {
    return <div>메세지가 도착 안함</div>;
  }

  const lastMessage = receivedMessages[receivedMessages.length - 1];
  const allNodeNames = nodes.map((node) => node.node_name);
  const { currentRailIndex, currentRailName, chkFirst } = lastMessage;

  // 모든 노드 이름에 대한 연결 정보 구축
  const nodeConnections = allNodeNames.reduce((result, nodeName) => {
    result[nodeName] = edges.filter((edge) => edge.from === nodeName);
    return result;
  }, {});

  // 현재 노드의 다음 가능한 노드 목록 추출
  let nextNodeName;
  let ableNextNodes;
  if (currentRailName) {
    if (chkFirst) nextNodeName = currentRailName.split("_")[0];
    else nextNodeName = currentRailName.split("_")[1];
    ableNextNodes = nodeConnections[nextNodeName];
  }

  // 가능한 다음 노드가 없는 경우 처리
  if (!ableNextNodes || ableNextNodes.length === 0) {
    ableNextNodes = [{ to: "메세지가 도착 안함" }];
  }

  return (
    <div>
      <div>
        <h2>명령어 목록</h2>
      </div>
      <div>
        <h3>한칸씩 전진하기</h3>
        <div>
          <label>현재 rail위치: </label>
          <span>{currentRailIndex}</span>
        </div>
        <div>
          <label>가능한 다음 Node: </label>
          {ableNextNodes.map((node, index) => (
            <div key={index}>
              <span key={index}>{node.to}</span>
              <button
                onClick={() =>
                  handleCommand({
                    carID,
                    sender: "Pub",
                    command: "toNode",
                    from: node.from,
                    to: node.to,
                  })
                }
              >
                {node.to}로 가기
              </button>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3>예전 목록</h3>
      </div>
      <div>
        <button
          onClick={() =>
            handleCommand({ carID, sender: "Pub", command: "start" })
          }
        >
          Start
        </button>
        <button
          onClick={() =>
            handleCommand({ carID, sender: "Pub", command: "stop" })
          }
        >
          Stop
        </button>
        <button
          onClick={() =>
            handleCommand({ carID, sender: "Pub", command: "branch1_fix" })
          }
        >
          1번분기FIX
        </button>
        <button
          disabled={disableBranch}
          onClick={() =>
            handleCommand({ carID, sender: "Pub", command: "branch1_1T" })
          }
        >
          1번분기_1T
        </button>
        <button
          onClick={() =>
            handleCommand({ carID, sender: "Pub", command: "branch2_fix" })
          }
        >
          2번분기_FIX
        </button>
        <button
          disabled={disableBranch}
          onClick={() =>
            handleCommand({ carID, sender: "Pub", command: "branch2_1T" })
          }
        >
          2번분기_1T
        </button>
        <button
          disabled={disableBranch}
          onClick={() =>
            handleCommand({ carID, sender: "Pub", command: "branch3_fix" })
          }
        >
          3번분기_FIX
        </button>
        <button
          disabled={disableBranch}
          onClick={() =>
            handleCommand({ carID, sender: "Pub", command: "branch3_1T" })
          }
        >
          3번분기_1T
        </button>
        <button
          onClick={() =>
            handleCommand({ carID, sender: "Pub", command: "defaultPath" })
          }
        >
          기본 동선 명령
        </button>
      </div>
    </div>
  );
};
