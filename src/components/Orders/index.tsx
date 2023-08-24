import { useEffect, useState } from "react";
import { OrdersBoard } from "../OrdersBoard";
import * as S from "./styles";
import { Order } from "../../types/Order";
import { api } from "../../utils/api";
import socketIo from "socket.io-client";

export function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const socket = socketIo("http://localhost:3003", {
      transports: ["websocket"],
    });

    socket.on("orders@new", (order) => {
      setOrders((prevState) => prevState.concat(order));
    });
  }, []);

  useEffect(() => {
    api.get("/orders").then(({ data }) => {
      setOrders(data);
    });
  }, []);

  const waitingOrders = orders.filter((order) => order.status === "WAITING");

  const inProductionOrders = orders.filter(
    (order) => order.status === "IN_PRODUCTION"
  );

  const doneOrders = orders.filter((order) => order.status === "DONE");

  function handleCancelOrder(orderId: string) {
    setOrders((prevState) =>
      prevState.filter((order) => order._id !== orderId)
    );
  }

  function handleOrderStatusChange(orderId: string, status: Order["status"]) {
    setOrders((prevState) =>
      prevState.map((order) =>
        order._id === orderId ? { ...order, status } : order
      )
    );
  }

  return (
    <S.Container>
      <OrdersBoard
        icon="🧭"
        title="Fila de espera"
        orders={waitingOrders}
        onCancelOrder={handleCancelOrder}
        onChangeOrderStatus={handleOrderStatusChange}
      />
      <OrdersBoard
        icon="👨‍🍳"
        title="Em preparação"
        orders={inProductionOrders}
        onCancelOrder={handleCancelOrder}
        onChangeOrderStatus={handleOrderStatusChange}
      />
      <OrdersBoard
        icon="✅"
        title="Pronto"
        orders={doneOrders}
        onCancelOrder={handleCancelOrder}
        onChangeOrderStatus={handleOrderStatusChange}
      />
    </S.Container>
  );
}
