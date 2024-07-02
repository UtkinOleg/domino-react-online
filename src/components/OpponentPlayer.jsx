import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import styled from 'styled-components';
import TileOnline from './TileOnline'
import { 
  restartGame,
  putTileToStock,
  drawTileToOpponent,
  drawTileToUser,
  drawFirstTileToPlayline,
  resetInitialStock,
  addOpponent,
  updateStock,
  updatePlayerStock,
  updateOpponentStock,
  sendStock,
  opponentMakesMove,
  updatePlayline,
  updateMove,
  updateFirstTile
} from '../redux/dominoSliceOnline'
import { StockContainer, Title, SubTitle as ST } from './styled'
import { socket } from '../util/socket';
import { dispatchConsequently } from '../util/tileOperations'

const SubTitle = styled(ST)`
  margin-bottom: 0.5rem;
`
const Message = styled(SubTitle)`
  font-weight: 200;
  font-size: 0.9rem;
  color: #555;
`
const WinMessage = styled(Message)`
  font-size: 1.3rem;
`
const LoseMessage = styled(WinMessage)`
  color: red;
`

const OpponentPlayer = () => {
  const dispatch = useDispatch()
  const {
    players: [user, opponentPlayer], 
    winner,
    stock,
    reload,
  } = useSelector((state) => state.domino_online)
  // alive delay
  const delay = 20000 // ms
  // alive state
  const [isAlive, setIsAlive] = useState(true);

  useEffect(() => {
    socket.connect();

    return () => {
      socket.timeout(5000).emit('events', 
        JSON.stringify({ alive: true, user: user, status: false }), () => {
      });
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    function onlineEvent(value) {
      const r = JSON.parse(value);
      console.log(r);

      // Opponent do miss move
      if (r?.missMove && r?.user?.id === opponentPlayer?.id) {
        const u = { id: r.user.id, name: r.user.name };
        console.log('miss move - ', u);
        dispatch(updateMove(user.id))
        setIsAlive(true)
      }

      // Opponent do handle tile
      if (r?.handleTile && r?.user?.id === opponentPlayer?.id) {
        const u = { id: r.user.id, name: r.user.name };
        console.log('handle tile - ', u);
        dispatch(updateOpponentStock(r.user.stock))
        dispatch(updateStock(r.stock))
        setIsAlive(true)
      }
      
      // Opponent make move
      if (r?.makeMove && r?.user?.id === opponentPlayer?.id) {
        const u = { id: r.user.id, name: r.user.name };
        console.log('make move - ', u);
        dispatch(opponentMakesMove(r.tile))
        dispatch(updatePlayline(r.playline))
        dispatch(updateMove(user.id))
        setIsAlive(true)
      }

      // Opponent is alive
      if (r?.alive && r?.user?.id === opponentPlayer?.id) {
        setIsAlive(r.status)
      }

      // Online first user init
      if (r?.online && r?.user?.id !== user?.id && !opponentPlayer) {
        const u = { id: r.user.id, name: r.user.name };
        console.log('add opponent - ', u);
        dispatch(addOpponent(u));
        socket.connect();
        socket.timeout(5000).emit('events', 
          JSON.stringify({ wannaStock: true, user: u, opponent: user }), () => {
        })
      }

      // The Opponent wants a new stock
      if (r?.wannaStock && r?.user?.id === user?.id && !opponentPlayer) {
        if (winner === null) {
          (async () => {
            const interval = 0.3
            const u = { id: r.opponent.id, name: r.opponent.name };

            console.log('add opponent - ', u);
            console.log('! restart game');

            dispatch(addOpponent(u));
            dispatch(resetInitialStock());

            if (true) {
              await dispatchConsequently(dispatch, {
                action: putTileToStock,
                steps: 28,
                interval: 0.05,
              })

              await dispatchConsequently(dispatch, {
                action: drawTileToOpponent,
                steps: 6,
                interval,
              })
    
              await dispatchConsequently(dispatch, {
                action: drawTileToUser,
                steps: 6,
                interval,
              })
    
              dispatch(drawFirstTileToPlayline())

              // Send new gameplay stocks to opponent
              dispatch(sendStock(u))
              dispatch(updateMove(user?.id))
            }
          })()
        }
      }

      // The Opponent receive a new stock
      if (r?.updateStock && r?.user?.id === user?.id && opponentPlayer) {
        if (winner === null) {
          (async () => {
            console.log('!! restart game for opponent');

            //dispatch(restartGame());
            dispatch(updateStock(r.stock));
            dispatch(updatePlayerStock(r.opponent_stock));
            dispatch(updateOpponentStock(r.user_stock));
            dispatch(updateFirstTile(r.first_tile));
            dispatch(drawFirstTileToPlayline());
            dispatch(updateMove(opponentPlayer?.id))
            
            // Send ready to start and waiting
            socket.connect();
            socket.timeout(5000).emit('events', 
              JSON.stringify({
                alive: true, 
                user: user
              }), () => {
            })
          })()
        }
      }

    }

    socket.on('events', onlineEvent);

    return () => {
      socket.off('events', onlineEvent);
    };
  }, [user, opponentPlayer, winner, stock, reload]);

  return (
    <>
      {opponentPlayer?.stock?.length > 0 ? (
        <>
          <Title>{`Игрок: ${opponentPlayer?.name}`}</Title>
          <StockContainer>
            {opponentPlayer?.stock?.map((tile) => (
              <TileOnline
                key={tile.id}
                tile={tile}
                size="sm"
                variant="dimmed"
                faceDown
              />
            ))}
          </StockContainer>
        </>
      ) : (
        <>
          {opponentPlayer?.name ? (
            <>
              <Title>{`Игрок: ${opponentPlayer?.name}`}</Title>
              <SubTitle>Ожидание начала игры</SubTitle>
            </>
          ) : (
            <>
              <LoseMessage>Ожидание подключения противника</LoseMessage>
            </>
          )}
        </>
      )}
    </>
  )
}

export default OpponentPlayer
