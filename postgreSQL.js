const { pool } = require("./conexionPostgreSQL");

const getClientes = async () => {
    try {
        const result = await pool.query("SELECT * from Cultivo");
        console.log(result.rows); // .rows contiene los resultados de la consulta
    } catch (error) {
        console.error(error);
    }
}

getClientes();