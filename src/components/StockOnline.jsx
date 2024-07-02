import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import styled from 'styled-components'
import TileOnline from './TileOnline'
import {
  restartGame,
  putTileToStock,
  drawTileToOpponent,
  drawTileToUser,
  drawFirstTileToPlayline,
  resetInitialStock,
} from '../redux/dominoSliceOnline'
import { StockContainer, Title, SubTitle as ST } from './styled'
import { dispatchConsequently } from '../util/tileOperations'
import { socket } from '../util/socket';

const SubTitle = styled(ST)`
  margin-bottom: 0.5rem;
`

const StockOnline = () => {
  const dispatch = useDispatch()
  const tiles = useSelector((state) => state.domino_online.stock)
  const { 
    players: [user, opponentPlayer], 
    winner, 
    reload,
    stock
  } = useSelector((state) => state.domino_online)

  // restart the game when winner is set to null
  /* useEffect(() => {
    if (winner === null) {
      (async () => {
        const interval = 0.3
        dispatch(restartGame());
        console.log(reload);
        if (!reload) {
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
        }
      })()
    }
  }, [user, opponentPlayer, winner, reload]) */

  return (
    <div>
      <Title>Игровые фишки</Title>
      {tiles?.length > 0 ? (
        <StockContainer>
          {tiles?.map((tile) => (
            <TileOnline
              key={tile.id}
              tile={tile}
              size="sm"
              color="textSecondary"
              duration={0.4}
              variant="dimmed"
            />
          ))}
        </StockContainer>
      ) : (
        <SubTitle>- нет фишек</SubTitle>
      )}
    </div>
  )
}

export default StockOnline
