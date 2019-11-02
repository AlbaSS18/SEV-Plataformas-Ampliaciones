class Enemigo extends Modelo {

    constructor(x, y) {
        super(imagenes.enemigo, x, y)
        this.estado = estados.moviendo;

        this.vy = 0;
        this.vx = 1;

        this.aMover = new Animacion(imagenes.enemigo_movimiento,
            this.ancho, this.alto, 6, 3);
        this.aMorir = new Animacion(imagenes.enemigo_morir,
            this.ancho,this.alto,6,8, this.finAnimacionMorir.bind(this));
        // Ref a la animación actual
        this.animacion = this.aMover;


        this.vxInteligencia = -1;
        this.vx = this.vxInteligencia;


    }

    finAnimacionMorir(){
        this.estado = estados.muerto;
    }


    actualizar (){
        // Actualizar animación
        this.animacion.actualizar();

        switch (this.estado){
            case estados.moviendo:
                this.animacion = this.aMover;
                break;
            case estados.muriendo:
                this.animacion = this.aMorir;
                break;
        }

        if ( this.estado == estados.muriendo) {
            this.vx = 0;
        } else {
            if ( this.vx == 0){
                this.vxInteligencia = this.vxInteligencia * -1;
                this.vx = this.vxInteligencia;
            }

            if (this.fueraPorDerecha ){
                // mover hacia la izquierda vx tiene que ser negativa
                if ( this.vxInteligencia > 0){
                    this.vxInteligencia = this.vxInteligencia * -1;
                }
                this.vx = this.vxInteligencia;
            }
            if (this.fueraPorIzquierda ){
                // mover hacia la derecha vx tiene que ser positiva
                if ( this.vxInteligencia < 0){
                    this.vxInteligencia = this.vxInteligencia * -1;
                }
                this.vx = this.vxInteligencia;
            }

        }


    }

    dibujar (scrollX){
        scrollX = scrollX || 0;
        this.animacion.dibujar(this.x - scrollX, this.y);
    }


    impactado(){
        if ( this.estado != estados.muriendo ){
            this.estado = estados.muriendo;
        }
    }


}
