import styles from 'styled-components';
export const Linea = styles.div`
    background-color: ${({ theme }) => theme.color2 };
    height: 2px;
    border-radius: 15px;
    margin: 20px 0;
    text-align: center;
    position: relative;
    span {
    top: -10px;
    position: absolute;
    background-color: ${({theme}) => theme.bgtotal};
    text-align: center;
    padding: 0 5px;
    color: ${({ theme }) => theme.color2 };
    font-weight: 700;
        }
`