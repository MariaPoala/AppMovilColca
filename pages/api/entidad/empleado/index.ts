import FnSaveData from "lib/database/api_data";
import EmpleadoModel from "models/empleado_model";

export default async function handler(req: any, res: any) {
    const { data, error } = await FnSaveData<EmpleadoModel>("empleado", req.method, req.body);
    if (error) {
        res.status(401).json(error);
    }
    else {
        res.status(200).json(data);
    }
}
