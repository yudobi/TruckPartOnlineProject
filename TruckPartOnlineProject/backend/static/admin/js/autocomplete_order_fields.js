// static/admin/js/autocomplete_order_fields.js
console.log("🚀 Script de autocompletado iniciado - VERSIÓN CON TOTAL CORREGIDO");

function cuandoJQueryEsteListo() {
    if (typeof django !== 'undefined' && django.jQuery) {
        console.log("✅ django.jQuery encontrado");
        var $ = django.jQuery;
        
        $(document).ready(function() {
            console.log("📄 DOM listo");
            
            // ============================================
            // FUNCIONES PARA ORDER ITEMS
            // ============================================
            
            // Calcular total de la orden
            function calcularTotalOrden() {
                var total = 0;
                var filasEncontradas = 0;
                
                // Buscar todas las filas de order items
                $('tr.form-row.dynamic-items, tr.dynamic-orderitems').each(function() {
                    var fila = $(this);
                    filasEncontradas++;
                    
                    // Buscar los inputs dentro de esta fila
                    var precioInput = fila.find('input[id*="price"]');
                    var cantidadInput = fila.find('input[id*="quantity"]');
                    
                    if (precioInput.length > 0 && cantidadInput.length > 0) {
                        var precio = parseFloat(precioInput.val()) || 0;
                        var cantidad = parseInt(cantidadInput.val()) || 0;
                        
                        var subtotal = precio * cantidad;
                        
                        console.log(`📊 Fila ${filasEncontradas} - Precio: ${precio}, Cantidad: ${cantidad}, Subtotal: ${subtotal}`);
                        
                        total += subtotal;
                    } else {
                        console.log(`⚠️ Fila ${filasEncontradas} - No tiene precio o cantidad`);
                    }
                });
                
                console.log(`📊 Total filas procesadas: ${filasEncontradas}, Total calculado: ${total.toFixed(2)}`);
                $('#id_total').val(total.toFixed(2));
                console.log("💰 Total actualizado:", total.toFixed(2));
            }
            
            // Obtener precio del producto
            function actualizarPrecioProducto(selectProducto) {
                // Encontrar la fila contenedora (tr)
                var fila = selectProducto.closest('tr');
                var precioInput = fila.find('input[id*="price"]');
                var cantidadInput = fila.find('input[id*="quantity"]');
                var productoId = selectProducto.val();
                
                console.log("🔍 Buscando fila para producto:", productoId);
                console.log("   Selector ID:", selectProducto.attr('id'));
                console.log("   Fila encontrada:", fila.length > 0);
                console.log("   Clases de la fila:", fila.attr('class'));
                console.log("   Input precio encontrado:", precioInput.length > 0);
                console.log("   ID del input precio:", precioInput.attr('id'));
                console.log("   Input cantidad encontrado:", cantidadInput.length > 0);
                console.log("   ID del input cantidad:", cantidadInput.attr('id'));
                
                if (productoId && fila.length > 0 && precioInput.length > 0) {
                    console.log("🔄 Producto seleccionado ID:", productoId);
                    precioInput.css('background-color', '#ffffcc');
                    
                    $.ajax({
                        url: '/api/products/' + productoId + '/',
                        method: 'GET',
                        success: function(data) {
                            console.log("✅ Precio recibido:", data.price);
                            
                            // Asignar el valor
                            precioInput.val(data.price);
                            
                            // Forzar eventos
                            precioInput.trigger('change');
                            precioInput.trigger('input');
                            
                            // Verificar
                            console.log("   Nuevo valor asignado:", precioInput.val());
                            
                            precioInput.css('background-color', '');
                            
                            // Calcular total inmediatamente
                            setTimeout(function() {
                                calcularTotalOrden();
                            }, 50);
                        },
                        error: function(xhr, status, error) {
                            console.error("❌ Error obteniendo precio:", error);
                            precioInput.css('background-color', '');
                        }
                    });
                } else {
                    console.log("❌ No se pudo encontrar la fila o el input de precio");
                }
            }
            
            // Configurar eventos en todas las filas
            function configurarTodosLosEventos() {
                console.log("🔧 Configurando eventos en todas las filas");
                
                // Configurar selects de producto
                $('select[id*="product"]').each(function() {
                    var selectProducto = $(this);
                    
                    if (selectProducto.data('eventos-configurados')) {
                        return;
                    }
                    
                    console.log(`🎯 Configurando producto: ${selectProducto.attr('id')}`);
                    
                    selectProducto.on('change', function() {
                        console.log("🔄 Evento change en producto");
                        actualizarPrecioProducto($(this));
                    });
                    
                    selectProducto.data('eventos-configurados', true);
                });
                
                // Configurar inputs de cantidad
                $('input[id*="quantity"]').each(function() {
                    var cantidadInput = $(this);
                    
                    if (cantidadInput.data('eventos-configurados')) {
                        return;
                    }
                    
                    cantidadInput.on('input', function() {
                        console.log("📊 Evento input en cantidad");
                        calcularTotalOrden();
                    });
                    
                    cantidadInput.data('eventos-configurados', true);
                });
                
                // Configurar inputs de precio (por si cambian manualmente)
                $('input[id*="price"]').each(function() {
                    var precioInput = $(this);
                    
                    if (precioInput.data('eventos-configurados')) {
                        return;
                    }
                    
                    precioInput.on('input', function() {
                        console.log("💰 Evento input en precio");
                        calcularTotalOrden();
                    });
                    
                    precioInput.data('eventos-configurados', true);
                });
            }
            
            // Configurar eventos iniciales
            configurarTodosLosEventos();
            
            // Observar nuevas filas
            var observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.addedNodes.length > 0) {
                        console.log("➕ Cambios detectados, reconfigurando eventos...");
                        setTimeout(function() {
                            configurarTodosLosEventos();
                            calcularTotalOrden();
                        }, 300);
                    }
                });
            });
            
            // Observar el tbody que contiene las filas
            var tbody = $('tbody.dynamic-orderitems').get(0);
            if (tbody) {
                observer.observe(tbody, {
                    childList: true,
                    subtree: true
                });
            } else {
                // Buscar el grupo de orderitems
                var orderGroup = document.getElementById('orderitems-group') || 
                                 document.querySelector('.inline-group');
                if (orderGroup) {
                    observer.observe(orderGroup, {
                        childList: true,
                        subtree: true
                    });
                }
            }
            
            // Activar para productos ya seleccionados
            setTimeout(function() {
                console.log("🎯 Activando para productos ya seleccionados");
                $('select[id*="product"]').each(function() {
                    if ($(this).val()) {
                        console.log(`   Producto ${$(this).attr('id')} ya tiene valor: ${$(this).val()}`);
                        actualizarPrecioProducto($(this));
                    }
                });
            }, 1000);
            
            // Calcular total inicial
            setTimeout(function() {
                console.log("🧮 Calculando total inicial...");
                calcularTotalOrden();
            }, 1500);
            
            // ============================================
            // FUNCIONES PARA DATOS DEL USUARIO
            // ============================================
            
            function autocompletarDatosUsuario() {
                var userId = $('#id_user').val();
                console.log("👤 Usuario seleccionado ID:", userId);
                
                if (!userId) {
                    $('#id_full_name, #id_guest_email, #id_phone').val('').prop('readonly', false);
                    return;
                }
                
                $('#id_full_name').css('background-color', '#ffffcc');
                
                $.ajax({
                    url: '/api/users/admin/get-user-data/' + userId + '/',
                    method: 'GET',
                    success: function(data) {
                        console.log("✅ Datos de usuario:", data);
                        $('#id_full_name').val(data.full_name || '').css('background-color', '');
                        $('#id_guest_email').val(data.email || '');
                        $('#id_phone').val(data.phone_number || '');
                        $('#id_full_name, #id_guest_email, #id_phone').prop('readonly', true);
                    },
                    error: function(xhr) {
                        console.error("❌ Error usuario:", xhr.status);
                        $('#id_full_name').css('background-color', '');
                    }
                });
            }
            
            $('#id_user').on('change', autocompletarDatosUsuario);
            
            if ($('#id_user').val()) {
                autocompletarDatosUsuario();
            }
            
            console.log("✅ Script con total corregido configurado");
        });
    } else {
        setTimeout(cuandoJQueryEsteListo, 100);
    }
}

cuandoJQueryEsteListo();